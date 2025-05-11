import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/users.entity';
import * as ms from 'ms';
import { UsersService } from 'src/users/users.service';
import { TokenType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  get refreshTokenConfig() {
    return {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    };
  }

  async signup(
    data: CreateUserDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const tokens = await this.tokenService.generateAuthTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  // refresh token config method using config service

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const refreshTokenExpiresInMs = ms(
      this.refreshTokenConfig.expiresIn || '7d',
    );
    const refreshTokenExpires = new Date(Date.now() + refreshTokenExpiresInMs);

    // Store the refresh token in the database
    await this.tokenService.storeToken(
      refreshToken,
      TokenType.REFRESH,
      userId,
      refreshTokenExpires,
    );

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.tokenService.deleteUserTokens(userId);
    return { success: true };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found!');

    const isPasswordMatched = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordMatched)
      throw new UnauthorizedException('Invalid Credentials!');

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
    };
  }

  async validateRefreshToken(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');

    const currentUser = { id: user.id };
    return currentUser;
  }

  async generateTokens(userId: string) {
    const payload: any = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const refreshTokenExpiresInMs = ms(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    );
    const refreshTokenExpires = new Date(Date.now() + refreshTokenExpiresInMs);

    await this.tokenService.storeToken(
      refreshToken,
      TokenType.REFRESH,
      userId,
      refreshTokenExpires,
    );

    // Return the login response
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  // Helper methods
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
