import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { UpdateSubscriptionDto } from "./dto/update-subscription.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PaymentsService } from "src/payments/payments.service";
import {
  Currency,
  PaymentPurpose,
  Prisma,
  SubscriptionStatus,
} from "@prisma/client";
import { createHash } from "crypto";
import { QuerySubscriptionDto } from "./dto/query-subscription.dto";
import { Subscription } from "./entities/subscription.entity";

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private readonly paymentService: PaymentsService
  ) {}

  async create(subscriptionData: CreateSubscriptionDto) {
    const price = subscriptionData.price;
    // console.log('Creating subscription:', subscriptionData);
    // console.log('User ID:', userId);

    try {
      //  verify no existing subscription
      const existingSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: subscriptionData.userId,
          status: "ACTIVE",
        },
      });

      if (existingSubscription) {
        throw new BadRequestException(
          "User already has an active subscription"
        );
      }

      const payment = await this.paymentService.create({
        userId: subscriptionData.userId,
        amount: subscriptionData?.price,
        currency: Currency.NGN,
        purpose: PaymentPurpose.SUBSCRIPTION,
      });

      if (!payment) {
        throw new BadRequestException("Error processing payment");
      }

      const subscription = await this.prisma.subscription.create({
        data: {
          userId: subscriptionData.userId,
          paymentId: payment.id,
          price: subscriptionData?.price,
          paidAt: new Date(),
        },
      });

      if (!subscription) {
        throw new BadRequestException("Error creating subscription");
      }

      return {
        status: "success",
        message: "Subscription created successfully",
        data: {
          paymentLink: payment.paymentLink,
          subscription,
        },
      };
    } catch (error) {
      console.log("Error creating subscription:", error.message);

      return new InternalServerErrorException(error.message);
    }
  }

  async findAll(queryDto: QuerySubscriptionDto): Promise<{
    subscriptions: Subscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { limit = 10, page = 1, status } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {};

    if (status) {
      where.status = status;
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        payment: true,
      },
    });

    const total = await this.prisma.subscription.count({
      where,
    });

    return {
      page,
      limit,
      total,
      subscriptions: subscriptions.map((sub) => new Subscription(sub)),
    };
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: true,
        payment: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found`);
    }

    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        user: true,
        payment: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Active subscription for user with ID ${userId} not found`
      );
    }

    return subscription;
  }

  async remove(id: string) {
    const existingSubscription = await this.findOne(id);

    if (!existingSubscription) {
      throw new NotFoundException(`Subscription not found`);
    }

    await this.prisma.subscription.delete({
      where: { id },
    });

    return {
      status: "success",
      message: "Subscription deleted successfully",
    };
  }
}
