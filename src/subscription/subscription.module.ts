import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PaymentsService } from 'src/payments/payments.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PaymentsService],
})
export class SubscriptionModule {}
