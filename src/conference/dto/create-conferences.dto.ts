import {
  IsString,
  IsOptional,
  IsISO8601,
  IsEnum,
  ValidateNested,
  IsArray,
  IsDate,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { CreateRegistrationTypeDto } from "src/registration-type/dto/create-registration-types.dto";
import { ConferenceStatus } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateConferenceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  date?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  earlyBirdRegistrationDeadline?: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  paperSubmissionDeadline?: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  registrationDeadline?: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  exactDate?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  objective?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  registration?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  callForPapers?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paperSubmission?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  programSchedule?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  venue?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  keynoteSpeakers?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @ApiProperty()
  @IsEnum(ConferenceStatus)
  @IsOptional()
  status?: ConferenceStatus = ConferenceStatus.DRAFT;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegistrationTypeDto)
  @IsOptional()
  registrationTypes?: CreateRegistrationTypeDto[];
}
