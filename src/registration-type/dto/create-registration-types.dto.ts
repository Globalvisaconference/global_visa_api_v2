import {
  IsString,
  IsOptional,
  IsPositive,
  IsInt,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationTypeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  availableFrom?: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  availableUntil?: Date;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  maxSlots?: number;
}
