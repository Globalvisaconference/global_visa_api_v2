import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty()
  @IsNumber()
  successRate: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reportDetails: string;
}
