import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { Currency, PaymentPurpose } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;
}
