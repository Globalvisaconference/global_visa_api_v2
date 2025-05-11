import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentPurpose, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  readonly paystackSecretKey: string;
  readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error(
        'PAYSTACK_SECRET_KEY is not defined in the configuration',
      );
    }
    this.paystackSecretKey = secretKey;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createPaymentDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId: createPaymentDto.userId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        purpose: createPaymentDto.purpose,
        status: PaymentStatus.PENDING,
      },
      include: {
        user: true,
      },
    });
    // Initialize payment with Paystack
    const paymentLink = await this.initializePaystackPayment(
      payment.id,
      user.email,
      createPaymentDto.amount,
      createPaymentDto.currency,
    );

    return {
      id: payment.id,
      payment,
      paymentLink,
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: false,
        registration: false,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment not found`);
    }

    const updatedData: any = { ...updatePaymentDto };

    // If payment status is changed to successful, set paidAt
    if (
      updatePaymentDto.status === PaymentStatus.SUCCESSFUL &&
      payment.status !== PaymentStatus.SUCCESSFUL
    ) {
      updatedData.paidAt = new Date();
    }

    return this.prisma.payment.update({
      where: { id },
      data: updatedData,
      include: {
        user: true,
        registration: true,
      },
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        user: true,
        registration: true,
      },
    });
  }

  // get total successful conference registrations
  async getTotalSuccessfulConferenceRegistrations() {
    const allRegistrations = await this.findAll();

    // calculate the total amount of all successful conference registrations
    let conferenceTotalRevenue = 0;
    let subscriptionTotalRevenue = 0;

    allRegistrations.forEach((registration) => {
      if (
        registration.purpose === PaymentPurpose.CONFERENCE &&
        registration.status === PaymentStatus.SUCCESSFUL
      ) {
        conferenceTotalRevenue += registration.amount;
      } else if (
        registration.purpose === PaymentPurpose.SUBSCRIPTION &&
        registration.status === PaymentStatus.SUCCESSFUL
      ) {
        subscriptionTotalRevenue += registration.amount;
      }
    });

    //

    return { conferenceTotalRevenue, subscriptionTotalRevenue };
  }

  // Private methods
  private async initializePaystackPayment(
    paymentId: string,
    email: string,
    amount: number,
    currency: string,
  ) {
    try {
      // Convert amount to kobo (for NGN) or cents (for other currencies)
      const amountInSmallestUnit = Math.round(amount * 100);

      const payload = JSON.stringify({
        email,
        amount: amountInSmallestUnit,
        currency,
        reference: `payment_${paymentId}_${Date.now()}`,
        callback_url: `${this.configService.get<string>('APP_URL')}/api/payments/verify`,
        metadata: {
          paymentId,
        },
      });

      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        // Update payment with the reference
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentGatewayRef: response.data.data.reference,
          },
        });

        return {
          status: response.data.status,
          message: response.data.message,
          paymentLink: response.data.data.authorization_url,
          paymentGatewayRef: response.data.data.reference,
        };
      } else {
        throw new BadRequestException('Failed to initialize payment');
      }
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(
          error.response.data.message || 'Failed to initialize payment',
        );
      }
      throw error;
    }
  }
}
