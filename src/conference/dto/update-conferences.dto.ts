import { PartialType } from '@nestjs/swagger';
import { CreateConferenceDto } from './create-conferences.dto';

export class UpdateConferenceDto extends PartialType(CreateConferenceDto) {}
