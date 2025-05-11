import {
  Currency,
  PaymentPurpose,
  PaymentStatus,
  Registration,
  User,
} from '@prisma/client';

export class Payment {
  id: string;
  userId: string;
  // registrationId?: string;
  amount: number;
  currency: Currency;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  paymentGatewayRef?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  registration?: Registration;
}
