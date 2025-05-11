import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  verified?: boolean;
}
