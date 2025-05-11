import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegistrationStatus } from '@prisma/client';
import { CreateRegistrationDto } from './create-registration.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRegistrationDto extends PartialType(
  OmitType(CreateRegistrationDto, [
    'conferenceId',
    'registrationTypeId',
  ] as const),
) {
  @ApiProperty()
  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paymentId?: string;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // token?: string;
}
