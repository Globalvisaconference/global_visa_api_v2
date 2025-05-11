import { PartialType } from '@nestjs/swagger';
import { CreateRegistrationTypeDto } from './create-registration-types.dto';

export class UpdateRegistrationTypeDto extends PartialType(
  CreateRegistrationTypeDto,
) {}
