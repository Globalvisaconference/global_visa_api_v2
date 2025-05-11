import { SubscriptionStatus } from '@prisma/client';
import { Payment } from 'src/payments/entities/payment.entity.dto';
import { User } from 'src/users/entities/users.entity';

export class Subscription {
  id: string;
  status: SubscriptionStatus;
  price: number;
  paidAt: Date;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  payment: Payment;

  constructor(partial: Partial<Subscription>) {
    Object.assign(this, partial);
  }
}
