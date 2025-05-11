import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { QueryRegistrationDto } from './dto/query-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { User } from 'src/users/entities/users.entity';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new registration' })
  @ApiResponse({
    status: 201,
    description: 'Registration created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Registration already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createRegistrationDto: CreateRegistrationDto,
    @CurrentUser() user,
  ) {
    return this.registrationsService.createRegistrartion(
      user.id,
      createRegistrationDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registrations' })
  @ApiResponse({ status: 200, description: 'OK', type: QueryRegistrationDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Registrations not found' })
  @ApiQuery({
    name: 'conferenceId',
    description: 'ID of the conference to which the registration type belongs',
    required: false,
    type: String,
  })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() queryDto: QueryRegistrationDto) {
    return this.registrationsService.findAll(queryDto);
  }

  @Get('verify-paystack-payment/:reference')
  async verifyPaystackPayment(@Param('reference') reference: string) {
    return this.registrationsService.verifyPaystackPayment(reference);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registrations for a user' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Registrations not found' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Get('user/:userId')
  findUserRegistrations(@Param('userId') userId: string) {
    return this.registrationsService.userRegistrations(userId);
  }

  // @Get('conference/:conferenceId/attendees')
  // findConferenceAttendees(@Param('conferenceId') conferenceId: string) {
  //   return this.registrationsService.conferenceAttendees(conferenceId);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify registration token' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Registration token not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({
    name: 'token',
    description: 'Registration token',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @Post('token/verify')
  findByToken(@CurrentUser() user: User, @Body() verifyBody) {
    return this.registrationsService.findByToken(
      verifyBody.token,
      verifyBody.passportNo,
      user.id,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get registration by ID' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({
    name: 'id',
    description: 'Registration ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration' })
  @ApiResponse({
    status: 200,
    description: 'Registration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'id',
    description: 'Registration ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(id, updateRegistrationDto);
  }

  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Confirm payment for registration' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Payment confirmed successfully',
  // })
  // @ApiResponse({ status: 404, description: 'Registration not found' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // @ApiResponse({ status: 400, description: 'Bad Request' })
  // @ApiParam({
  //   name: 'id',
  //   description: 'Registration ID',
  //   type: String,
  //   required: true,
  // })
  // @UseGuards(JwtAuthGuard)
  // @Patch(':id/confirm-payment')
  // confirmPayment(
  //   @Param('id') id: string,
  //   @Body('paymentId') paymentId: string,
  // ) {
  //   if (!paymentId) {
  //     throw new BadRequestException('Payment ID is required');
  //   }
  //   return this.registrationsService.confirmPayment(id, paymentId);
  // }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel registration' })
  @ApiResponse({
    status: 200,
    description: 'Registration cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiParam({
    name: 'id',
    description: 'Registration ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.registrationsService.cancel(id);
  }
}
