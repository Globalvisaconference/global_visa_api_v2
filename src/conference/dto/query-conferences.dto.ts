import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ConferenceStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class QueryConferenceDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ConferenceStatus)
  status?: ConferenceStatus;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
