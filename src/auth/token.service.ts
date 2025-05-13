// src/auth/token.service.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
// import { Token, TokenType, User } from '@prisma/client';
import { v4 as uuidv4 } from "uuid";
import * as ms from "ms";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "src/users/entities/users.entity";
import { Token, TokenType } from "@prisma/client";

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async generateAuthTokens(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateToken(
      user,
      TokenType.ACCESS,
      this.configService.get<string>("JWT_SECRET") as string,
      this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "15m"
    );

    const refreshToken = await this.generateToken(
      user,
      TokenType.REFRESH,
      this.configService.get<string>("JWT_SECRET") as string,
      this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "7d"
    );

    // Store the refresh token in the database
    await this.storeToken(
      refreshToken.token,
      TokenType.REFRESH,
      user.id,
      refreshToken.expires
    );

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  async refreshAuthToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    const tokenDoc = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenDoc || tokenDoc.type !== TokenType.REFRESH) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (new Date() > tokenDoc.expires) {
      throw new UnauthorizedException("Refresh token expired");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: tokenDoc.userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const accessToken = await this.generateToken(
      user,
      TokenType.ACCESS,
      this.configService.get<string>("JWT_SECRET") as string,
      this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "15m"
    );

    return { accessToken: accessToken.token };
  }

  async generateEmailVerificationToken(user: User) {
    return this.generateToken(
      user,
      TokenType.VERIFY_EMAIL,
      this.configService.get<string>("JWT_SECRET") as string,
      this.configService.get<string>("EMAIL_VERIFICATION_EXPIRATION") || "24h"
    );
  }

  async generatePasswordResetToken(user: User) {
    return this.generateToken(
      user,
      TokenType.RESET_PASSWORD,
      this.configService.get<string>("JWT_SECRET") as string,
      this.configService.get<string>("PASSWORD_RESET_EXPIRATION") || "1h"
    );
  }

  async deleteUserTokens(userId: string, type?: TokenType) {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    return this.prisma.token.deleteMany({
      where,
    });
  }

  async storeToken(
    token: string,
    type: TokenType,
    userId: string,
    expires: Date
  ): Promise<Token> {
    // Delete existing tokens of the same type for the user
    await this.deleteUserTokens(userId, type);

    // Store the token in the database
    return this.prisma.token.create({
      data: {
        token,
        type,
        expires,
        userId,
      },
    });
  }

  // Helper methods
  private async generateToken(
    user: User,
    type: TokenType,
    secret: string,
    expiration: string
  ): Promise<{ token: string; expires: Date }> {
    const expiresIn = ms(expiration);
    const expires = new Date(Date.now() + expiresIn);

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type,
        jti: uuidv4(),
      },
      {
        secret,
        expiresIn: Math.floor(expiresIn / 1000),
      }
    );

    return { token, expires };
  }
}
