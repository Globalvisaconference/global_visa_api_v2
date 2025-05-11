import {
  Conference,
  RegistrationStatus,
  RegistrationType,
} from '@prisma/client';
import { Payment } from 'src/payments/entities/payment.entity.dto';
import { User } from 'src/users/entities/users.entity';

export class Registration {
  status: RegistrationStatus;
  paymentId: string | null;
  payment?: Payment;
  token?: string | null;
  registrationType?: RegistrationType;
  // paymentGatewayRef: string | null;
  // id: string | undefined;
  userId: string;
  user?: User;
  // conferenceId: string;
  conference?: Conference;
  // registrationTypeId: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Registration>) {
    Object.assign(this, partial);
  }
}
