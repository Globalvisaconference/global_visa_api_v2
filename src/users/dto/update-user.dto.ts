import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {
  @IsOptional()
  isPremium: boolean;

  @IsOptional()
  isActive: boolean;

  @IsOptional()
  @IsEnum(Role)
  role: Role;
}
