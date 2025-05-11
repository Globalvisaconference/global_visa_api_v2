import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryDto: any): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      firstName,
      lastName,
      email,
      isActive,
      role,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    // Build the where clause based on the provided filters
    const where: Prisma.UserWhereInput = {};

    if (firstName) {
      where.firstName = { contains: firstName, mode: 'insensitive' };
    }

    if (lastName) {
      where.lastName = { contains: lastName, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (role) {
      where.role = role;
    }

    // Get users with pagination
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get total count for pagination
    const total = await this.prisma.user.count({ where });

    return {
      total,
      page,
      limit,
      users: users.map((user) => new User(user)),
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // console.log('User Data service:', user);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return new User(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    // console.log('User Data service:', user);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return new User(user);
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<{
    data: User;
    status: 'success' | 'error';
    message: string;
  }> {
    try {
      // Check if user with the given ID exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!existingUser) {
        throw new NotFoundException(`User not found`);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      return {
        status: 'success',
        message: 'User updated successfully',
        data: new User(user),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user',
        error.message,
      );
    }
  }

  async deleteUser(
    id: string,
  ): Promise<{ status: 'success' | 'error'; message: string }> {
    try {
      // Check if user with the given ID exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!existingUser) {
        throw new NotFoundException(`User not found`);
      }

      // Delete related tokens
      await this.prisma.token.deleteMany({
        where: { userId: id },
      });

      // Delete the user
      await this.prisma.user.delete({
        where: { id },
      });

      return {
        status: 'success',
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user',
        error.message,
      );
    }
  }
}
