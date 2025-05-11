import { Role } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  firstName: string;
  lastName: string;
  isActive: boolean;
  role: Role;

  passportNo?: string | null;
  passportCountry?: string | null;
  dateOfBirth?: Date | null;
  phoneNumber?: string | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
