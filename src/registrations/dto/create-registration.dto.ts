import { IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { RegistrationStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty()
  @IsString()
  conferenceId: string;

  @ApiProperty()
  @IsString()
  registrationTypeId: string;

  @ApiProperty()
  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus = RegistrationStatus.PENDING;

  @IsString()
  passportNo: string;

  @IsString()
  passportCountry: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  phoneNumber: string;

  @IsInt()
  price: number;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // paymentId?: string;
}
