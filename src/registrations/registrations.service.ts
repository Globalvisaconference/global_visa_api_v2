import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Registration } from './entities/registration.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { QueryRegistrationDto } from './dto/query-registration.dto';
import {
  Currency,
  PaymentPurpose,
  PaymentStatus,
  Prisma,
  RegistrationStatus,
  SubscriptionStatus,
} from '@prisma/client';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { createHash } from 'crypto';
import { PaymentsService } from 'src/payments/payments.service';
import axios from 'axios';

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private readonly paymentService: PaymentsService,
  ) {}

  async createRegistrartion(
    userId: string,
    registrationData: CreateRegistrationDto,
  ) {
    try {
      // Verify that the registration type exists
      const registrationType = await this.prisma.registrationType.findUnique({
        where: { id: registrationData.registrationTypeId },
      });

      if (!registrationType) {
        throw new NotFoundException(`Registration type not found`);
      }

      // If the registration type has a price, create a payment first

      const payment = await this.paymentService.create({
        userId,
        amount: registrationData.price,
        currency: Currency.NGN, // Adjust as needed
        purpose: PaymentPurpose.CONFERENCE,
      });
      // paymentId = payment.id;

      if (!payment) {
        throw new BadRequestException('Error creating payment');
      }

      // Generate a unique token for the registration
      const paymentToken = this.generateToken(
        registrationType.name,
        registrationType.id, // Assuming conferenceId is available
        // registrationExists.id,
      );

      if (!paymentToken) {
        throw new BadRequestException('Error generating payment token');
      }

      // Create the registration
      const registration = await this.prisma.registration.create({
        data: {
          userId,
          conferenceId: registrationType.conferenceId,
          registrationTypeId: registrationData.registrationTypeId,
          token: paymentToken,
          paymentId: payment.id, // Link the payment ID
          status: RegistrationStatus.PENDING,
        },
      });

      // update user table with passport details(passportNo, passportCountry, dateOfBirth & phoneNumber)
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passportNo: registrationData.passportNo,
          passportCountry: registrationData.passportCountry,
          dateOfBirth: registrationData.dateOfBirth,
          phoneNumber: registrationData.phoneNumber,
        },
      });

      if (!registration) {
        throw new ConflictException('Registration already exists');
      }

      return {
        status: 'success',
        message: 'Registration created successfully',
        paymentLink: payment.paymentLink,
      };
    } catch (error) {
      console.log('Error creating registration', error.message);

      throw new InternalServerErrorException(
        `Error creating registration: ${error.message}`,
      );
    }
  }

  async findAll(queryDto: QueryRegistrationDto): Promise<{
    registrations: Registration[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    // Build the where clause based on the provided filters
    const where: Prisma.RegistrationWhereInput = {};

    if (status) {
      where.status = status;
    }

    // Get registrations with pagination
    const registrations = await this.prisma.registration.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        conference: true,
        registrationType: true,
        payment: true,
      },
    });

    // Get total count for pagination
    const total = await this.prisma.registration.count({ where });

    return {
      registrations: registrations.map(
        (registration) => new Registration(registration),
      ),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Registration> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        user: true,
        conference: true,
        registrationType: true,
        payment: true,
      },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return new Registration(registration);
  }

  async findByToken(
    token: string,
    passportNo: string,
    userId: string,
  ): Promise<Registration> {
    const registration = await this.prisma.registration.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!registration) {
      throw new NotFoundException(`Registration token found`);
    }

    // if found and not paid
    if (registration && registration.status !== RegistrationStatus.PAID) {
      throw new BadRequestException(`Registration is not paid`);
    }

    // check if userId matches with registration.userId,
    // if yes, make sure that token and user passportNo
    // is valid in our databsebase before returning registration

    if (
      registration.userId !== userId ||
      registration.token !== token ||
      registration.user.passportNo !== passportNo
    ) {
      throw new NotFoundException(`Registration token found`);
    }

    return new Registration(registration);
  }

  async update(
    id: string | undefined,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<Registration> {
    try {
      const registration = await this.prisma.registration.update({
        where: { id },
        data: updateRegistrationDto,
        include: {
          user: true,
          conference: true,
          registrationType: true,
        },
      });

      return new Registration(registration);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating registration: ${error.message}`,
      );
    }
  }

  async cancel(id: string): Promise<Registration> {
    try {
      // Check if registration exists
      const registrationExists = await this.prisma.registration.findUnique({
        where: { id },
      });
      if (!registrationExists) {
        throw new NotFoundException(`Registration not found`);
      }
      // Check if registration is already cancelled
      if (registrationExists.status === RegistrationStatus.CANCELLED) {
        throw new BadRequestException(`Registration is already cancelled`);
      }
      // Check if registration is already paid
      if (registrationExists.status === RegistrationStatus.PAID) {
        throw new BadRequestException(`Paid registration cannot be cancelled`);
      }

      const registration = await this.prisma.registration.update({
        where: { id },
        data: {
          status: RegistrationStatus.CANCELLED,
        },
        include: {
          user: true,
          conference: true,
          registrationType: true,
        },
      });

      return new Registration(registration);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error cancelling registration: ${error.message}`,
      );
    }
  }

  async userRegistrations(userId: string): Promise<Registration[]> {
    try {
      const registrations = await this.prisma.registration.findMany({
        where: {
          userId,
          status: {
            in: ['PENDING', 'PAID'],
          },
        },
        include: {
          conference: true,
          registrationType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return registrations.map(
        (registration) => new Registration(registration),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching user registrations: ${error.message}`,
      );
    }
  }

  async verifyPaystackPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.paymentService.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paymentService.paystackSecretKey}`,
          },
        },
      );

      // console.log('Payment verification response:', response.data.data);

      // if (!response.data.status) {
      //   throw new BadRequestException('Payment verification failed');
      // }

      if (response.data.data && response.data.data.status === 'abandoned') {
        throw new BadRequestException(
          'Payment verification failed, payment was abandoned',
        );
      }

      if (response.data.status && response.data.data.status === 'success') {
        // Find the payment by reference
        const payment = await this.prisma.payment.findFirst({
          where: { paymentGatewayRef: reference },
        });

        if (!payment) {
          throw new NotFoundException(`Payment reference not found`);
        }

        const updatedPayment = await this.paymentService.update(payment.id, {
          status: PaymentStatus.SUCCESSFUL,
        });

        if (!updatedPayment) {
          throw new BadRequestException('Error updating payment status');
        }

        // console.log('payment', payment);÷\
        const { registration } = updatedPayment;

        if (updatedPayment.purpose === PaymentPurpose.CONFERENCE) {
          // make sure the registration is not paid for this conference
          const existingRegistration = await this.prisma.registration.findFirst(
            {
              where: {
                conferenceId: registration?.conferenceId,
                status: RegistrationStatus.PAID,
                paymentId: registration?.paymentId,
              },
            },
          );

          if (existingRegistration) {
            throw new BadRequestException(
              'Conference has already been paid for',
            );
          }

          // Update payment status
          const updatedRegistration = await this.update(registration?.id, {
            status: RegistrationStatus.PAID,
          });

          if (!updatedRegistration) {
            throw new BadRequestException('Error updating registration status');
          }
        }

        if (payment.purpose === PaymentPurpose.SUBSCRIPTION) {
          // make sure the subscription is not active
          const existingSubscription = await this.prisma.subscription.findFirst(
            {
              where: {
                userId: payment.userId,
                status: SubscriptionStatus.ACTIVE,
              },
            },
          );

          if (existingSubscription) {
            throw new BadRequestException(
              'User already has an active subscription',
            );
          }
          // Update payment status
          const updatedSubscription = await this.prisma.subscription.update({
            where: { paymentId: payment.id },
            data: {
              status: SubscriptionStatus.ACTIVE,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
            include: {
              user: true,
              payment: true,
            },
          });

          if (!updatedSubscription) {
            throw new BadRequestException('Error updating subscription status');
          }

          // update user profile
          await this.prisma.user.update({
            where: { id: updatedSubscription.userId },
            data: {
              isPremium: true,
            },
          });
        }

        return {
          status: 'success',
          data: updatedPayment,
        };
      }
    } catch (error) {
      // console.log('Error verifying payment:', error);

      return new InternalServerErrorException(`${error.message}`);

      // if (error.response) {
      // throw new InternalServerErrorException(error.response.message);
      // }
      // throw error;
    }
  }

  // generate a unique token for the registration
  private generateToken(
    conferenceType: string,
    registrationId: string,
  ): string {
    const type = conferenceType.replace(/\s+/g, '').toUpperCase();
    // const type = conferenceType.toUpperCase();
    const rawString = `${registrationId}-${Date.now()}`;
    const hash = createHash('sha256')
      .update(rawString)
      .digest('hex')
      .substring(0, 6)
      .toUpperCase();

    return `GVC-${type}-${hash}`;
  }
}
