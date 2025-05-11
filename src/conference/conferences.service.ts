import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Conference } from './entities/conferences.entity';
import { CreateConferenceDto } from './dto/create-conferences.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryConferenceDto } from './dto/query-conferences.dto';
import { UpdateConferenceDto } from './dto/update-conferences.dto';
import { ConferenceStatus, Prisma } from '@prisma/client';

@Injectable()
export class ConferencesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateConferenceDto): Promise<Conference> {
    try {
      const { registrationTypes, ...conferenceData } = data;

      const conference = await this.prisma.conference.create({
        data: {
          ...conferenceData,
          registrationTypes: registrationTypes
            ? {
                create: registrationTypes,
              }
            : undefined,
        },
        include: {
          registrationTypes: true,
        },
      });

      if (!conference) {
        throw new NotFoundException(`Conference not found`);
      }
      return new Conference(conference);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating conference: ${error.message}`,
      );
    }
  }

  async findAll(queryDto: QueryConferenceDto): Promise<{
    conferences: Conference[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      name,
      topic,
      city,
      country,
      status,
      page = 1,
      limit = 12,
    } = queryDto;
    const skip = (page - 1) * limit;

    // Build the where clause based on the provided filters
    const where: Prisma.ConferenceWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (topic) {
      where.topic = { contains: topic, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    // Get conferences with pagination
    const conferences = await this.prisma.conference.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        registrationTypes: true,
        Registration: true,
      },
    });

    // Get total count for pagination
    const total = await this.prisma.conference.count({ where });

    return {
      total,
      page,
      limit,
      conferences: conferences.map((conference) => new Conference(conference)),
    };
  }

  async findOne(id: string): Promise<Conference> {
    // Check if the conference exists
    const conferenceExists = await this.prisma.conference.findUnique({
      where: { id },
    });
    if (!conferenceExists) {
      throw new NotFoundException(`Conference not found`);
    }

    // Fetch the conference details
    const conference = await this.prisma.conference.findUnique({
      where: { id },
      include: {
        registrationTypes: true,
      },
    });

    if (!conference) {
      throw new NotFoundException(`Conference with ID ${id} not found`);
    }

    return new Conference(conference);
  }

  async update(
    id: string,
    updateConferenceDto: UpdateConferenceDto,
  ): Promise<Conference> {
    try {
      // Check if the conference exists
      const existingConference = await this.prisma.conference.findUnique({
        where: { id },
        include: { registrationTypes: true },
      });

      if (!existingConference) {
        throw new NotFoundException(`Conference with ID ${id} not found`);
      }

      const { registrationTypes, ...conferenceData } = updateConferenceDto;

      // Start a transaction to update both the conference and its registration types
      const conference = await this.prisma.$transaction(async (prisma) => {
        // Update the conference
        const updatedConference = await prisma.conference.update({
          where: { id },
          data: conferenceData,
          include: { registrationTypes: true },
        });

        // If registration types are provided, handle them
        if (registrationTypes && registrationTypes.length > 0) {
          // First, delete all existing registration types for this conference
          await prisma.registrationType.deleteMany({
            where: { conferenceId: id },
          });

          // Then create new registration types
          for (const registrationType of registrationTypes) {
            await prisma.registrationType.create({
              data: {
                ...registrationType,
                conferenceId: id,
              },
            });
          }

          // Fetch the conference with updated registration types
          return await prisma.conference.findUnique({
            where: { id },
            include: { registrationTypes: true },
          });
        }

        return updatedConference;
      });

      if (!conference) {
        throw new NotFoundException(`Conference with ID ${id} not found`);
      }

      return new Conference(conference);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating conference: ${error.message}`,
      );
    }
  }

  async remove(
    id: string,
  ): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      // Check if the conference exists
      const conferenceExists = await this.prisma.conference.findUnique({
        where: { id },
      });
      if (!conferenceExists) {
        throw new NotFoundException(`Conference not found`);
      }
      // Delete the conference
      await this.prisma.conference.delete({
        where: { id },
      });

      return {
        status: 'success',
        message: 'Conference deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting conference: ${error.message}`,
      );
    }
  }

  async updateStatus(
    id: string,
    status: ConferenceStatus,
  ): Promise<{
    data: Conference;
    status: 'status' | 'error';
    message: string;
  }> {
    try {
      // Check if the conference exists
      const conferenceExists = await this.prisma.conference.findUnique({
        where: { id },
      });
      if (!conferenceExists) {
        throw new NotFoundException(`Conference not found`);
      }

      // Update the conference status
      const conference = await this.prisma.conference.update({
        where: { id },
        data: { status },
        include: { registrationTypes: true },
      });

      return {
        status: 'status',
        message: 'Conference status updated successfully',
        data: new Conference(conference),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating conference status: ${error.message}`,
      );
    }
  }
}
