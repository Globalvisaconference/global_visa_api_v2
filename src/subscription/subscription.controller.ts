import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { QuerySubscriptionDto } from "./dto/query-subscription.dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User } from "src/users/entities/users.entity";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";

@Controller("subscription")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() subscriptionData: CreateSubscriptionDto) {
    return this.subscriptionService.create(subscriptionData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() queryDto: QuerySubscriptionDto) {
    return this.subscriptionService.findAll(queryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.subscriptionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.subscriptionService.remove(id);
  }
}
