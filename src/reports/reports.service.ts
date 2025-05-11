import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Report } from './entities/report.entity';
import { ServiceResponse } from 'src/utils/types/response.type';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createReportDto: CreateReportDto,
  ): ServiceResponse<Report> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: createReportDto.documentId },
        include: { Report: true },
      });

      if (!document) {
        throw new NotFoundException(`Document not found`);
      }

      if (document.Report) {
        throw new BadRequestException(`Document already reviewed`);
      }

      const report = await this.prisma.report.create({
        data: {
          userId,
          ...createReportDto,
          documentId: createReportDto.documentId,
        },
      });

      // Update document as verified
      await this.prisma.document.update({
        where: { id: createReportDto.documentId },
        data: { verified: true },
      });

      return {
        status: 'success',
        message: 'Report created successfully',
        data: new Report(report),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    const reports = await this.prisma.report.findMany();
    return reports.map((report) => new Report(report));
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return new Report(report);
  }

  async findUserReports(userId: string) {
    const reports = await this.prisma.report.findMany({
      where: { userId },
    });

    if (!reports || reports.length === 0) {
      throw new NotFoundException('No reports found for this user');
    }

    return reports.map((report) => new Report(report));
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
  ): ServiceResponse<Report> {
    try {
      const report = await this.findOne(id);

      const updatedReport = await this.prisma.report.update({
        where: { id: report.id },
        data: updateReportDto,
      });

      return {
        status: 'success',
        message: 'Report updated successfully',
        data: new Report(updatedReport),
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string): ServiceResponse<Report> {
    await this.findOne(id);

    await this.prisma.report.delete({
      where: { id },
    });

    return {
      status: 'success',
      message: 'Report deleted successfully',
    };
  }
}
