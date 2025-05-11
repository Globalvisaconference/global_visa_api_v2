import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegistrationTypeDto } from './dto/create-registration-types.dto';
import { RegistrationType } from './entities/registration-types.entity';
import { UpdateRegistrationTypeDto } from './dto/update-registration-types.dto';

@Injectable()
export class RegistrationTypesService {
  constructor(private prisma: PrismaService) {}

  async create(
    conferenceId: string,
    data: CreateRegistrationTypeDto,
  ): Promise<RegistrationType> {
    try {
      // First, check if the conference exists
      const conference = await this.prisma.conference.findUnique({
        where: { id: conferenceId },
      });

      if (!conference) {
        throw new NotFoundException(`Conference not found`);
      }

      const registrationType = await this.prisma.registrationType.create({
        data: {
          ...data,
          conferenceId,
        },
      });

      return new RegistrationType(registrationType);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating registration type: ${error.message}`,
      );
    }
  }

  async findAll(conferenceId: string): Promise<RegistrationType[]> {
    try {
      // First, check if the conference exists
      const conference = await this.prisma.conference.findUnique({
        where: { id: conferenceId },
      });

      if (!conference) {
        throw new NotFoundException(`Conference not found`);
      }

      // Fetch all registration types for the given conference
      const registrationTypes = await this.prisma.registrationType.findMany({
        where: { conferenceId },
      });

      return registrationTypes.map(
        (registrationType) => new RegistrationType(registrationType),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching registration types: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<RegistrationType> {
    const registrationType = await this.prisma.registrationType.findUnique({
      where: { id },
    });

    if (!registrationType) {
      throw new NotFoundException(`Registration type not found`);
    }

    return new RegistrationType(registrationType);
  }

  async update(
    id: string,
    data: UpdateRegistrationTypeDto,
  ): Promise<RegistrationType> {
    try {
      const registrationType = await this.prisma.registrationType.update({
        where: { id },
        data,
      });

      return new RegistrationType(registrationType);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating registration type: ${error.message}`,
      );
    }
  }

  async remove(
    id: string,
  ): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      const registrationType = await this.prisma.registrationType.delete({
        where: { id },
      });

      if (!registrationType) {
        throw new NotFoundException(`Registration type not found`);
      }

      return {
        status: 'success',
        message: 'Registration type deleted successfully',
      };
    } catch (error) {
      console.log('Error deleting registration type:', error);

      throw new InternalServerErrorException(
        `Error deleting registration type: ${error.message}`,
      );
    }
  }
}
