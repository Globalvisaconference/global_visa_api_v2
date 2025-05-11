import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  tags: string[];

  @IsBoolean()
  published: boolean;

  @IsString()
  @IsOptional()
  short_intro: string;

  @IsOptional()
  @IsString()
  // @IsUrl()
  imageUrl: string;
}
