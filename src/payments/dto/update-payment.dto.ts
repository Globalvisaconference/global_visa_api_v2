import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(
  OmitType(CreatePaymentDto, [
    'userId',
    'amount',
    'currency',
    'purpose',
  ] as const),
) {
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}
