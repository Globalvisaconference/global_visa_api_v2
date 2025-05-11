import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class queryPostDto {
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
