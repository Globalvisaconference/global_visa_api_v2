import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdateBlogDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Post } from './entities/post.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, postData: CreatePostDto) {
    try {
      const existingPost = await this.prisma.post.findUnique({
        where: { title: postData.title },
      });

      if (existingPost) {
        throw new ConflictException('Post with this title already exists');
      }

      const post = await this.prisma.post.create({
        data: {
          ...postData,
          authorId: userId,
        },
      });

      if (!post) {
        throw new InternalServerErrorException('Failed to create post');
      }

      return {
        status: 'success',
        message: 'Post created successfully',
        data: new Post(post),
      };
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }

  async findAll(queryDto: any): Promise<{
    data: Post[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { title, page = 1, limit = 10 } = queryDto;

    // Build the where clause based on the provided filters
    const where: Prisma.PostWhereInput = {};

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const posts = await this.prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
      },
    });

    const total = await this.prisma.post.count();

    return {
      total,
      page,
      limit,
      data: posts.map((post) => new Post(post)),
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return new Post(post);
  }

  async update(id: string, updatePostData: UpdateBlogDto) {
    try {
      await this.findOne(id);

      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: updatePostData,
      });

      return {
        status: 'success',
        message: 'Post updated successfully',
        data: new Post(updatedPost),
      };
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existingPost = await this.findOne(id);

      await this.prisma.post.delete({
        where: { id: existingPost.id },
      });

      return {
        status: 'success',
        message: 'Post deleted successfully',
      };
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }
}
