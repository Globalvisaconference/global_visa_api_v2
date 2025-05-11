import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QueryDocumentDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
