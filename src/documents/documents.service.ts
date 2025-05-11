import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Document } from './entities/document.entity';
import { ServiceResponse } from 'src/utils/types/response.type';
import { QueryDocumentDto } from './dto/query-document.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: string,
  ): ServiceResponse<Document> {
    try {
      const document = await this.prisma.document.create({
        data: {
          ...createDocumentDto,
          userId,
        },
        // include: {
        //   Report: true,
        // },
      });

      return {
        status: 'success',
        message: 'Document added successfully',
        data: new Document(document),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async findAll(queryDto: QueryDocumentDto): Promise<{
    documents: Document[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = queryDto;

    // Build the where clause based on the provided filters
    const where: Prisma.DocumentWhereInput = {};

    const skip = (page - 1) * limit;
    const documents = await this.prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        Report: true,
      },
    });

    // get total count for pagination
    const total = await this.prisma.document.count();
    return {
      total,
      page,
      limit,
      documents: documents.map((document) => new Document(document)),
    };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        Report: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return new Document(document);
  }

  // documents of a specific user
  async findByUserId(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      include: {
        Report: true,
      },
    });

    if (!documents) {
      throw new NotFoundException('Documents not found for this user');
    }

    return documents.map((document) => new Document(document));
  }

  // find document reports
  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): ServiceResponse<Document> {
    try {
      const existingDocument = await this.prisma.document.findUnique({
        where: { id },
      });

      if (!existingDocument) {
        throw new NotFoundException('Document not found');
      }

      const document = await this.prisma.document.update({
        where: { id },
        data: updateDocumentDto,
      });

      return {
        message: 'Document updated successfully',
        status: 'success',
        data: new Document(document),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update document');
    }
  }

  async remove(id: string): ServiceResponse<Document> {
    try {
      const existingDocument = await this.prisma.document.findUnique({
        where: { id },
      });
      if (!existingDocument) {
        throw new NotFoundException('Document not found');
      }

      await this.prisma.document.delete({ where: { id } });

      return {
        status: 'success',
        message: 'Document deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('');
    }
  }
}
