import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { RegistrationStatus } from '@prisma/client';

export class QueryRegistrationDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => parseInt(value))
  userId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => parseInt(value))
  conferenceId?: string;

  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
