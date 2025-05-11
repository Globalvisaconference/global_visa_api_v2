import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { User } from '@prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() paymentData: CreatePaymentDto,
    @CurrentUser() user: User,
  ) {
    paymentData.userId = user.id;
    return this.paymentService.create(paymentData);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.paymentService.findAll();
  }

  // Conference successful total registrations
  @Get('total-successful-conference-registrations')
  @UseGuards(JwtAuthGuard)
  async getTotalSuccessfulConferenceRegistrations() {
    return await this.paymentService.getTotalSuccessfulConferenceRegistrations();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: User) {
    return this.paymentService.findOne(user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: UpdatePaymentDto) {
    return this.paymentService.update(id, data);
  }
}
