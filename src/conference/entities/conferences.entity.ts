import { ConferenceStatus } from '@prisma/client';
import { RegistrationType } from 'src/registration-type/entities/registration-types.entity';

export class Conference {
  id: string;
  name: string;
  image?: string | null;
  topic?: string | null;
  date?: Date | null;
  city?: string | null;
  country?: string | null;
  earlyBirdRegistrationDeadline?: Date | null;
  paperSubmissionDeadline?: Date | null;
  registrationDeadline?: Date | null;
  exactDate?: Date | null;
  objective?: string | null;
  registration?: string | null;
  callForPapers?: string | null;
  paperSubmission?: string | null;
  programSchedule?: string | null;
  venue?: string | null;
  keynoteSpeakers?: string | null;
  termsAndConditions?: string | null;
  status: ConferenceStatus;
  registrationTypes?: RegistrationType[] | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Conference>) {
    Object.assign(this, partial);
  }
}
