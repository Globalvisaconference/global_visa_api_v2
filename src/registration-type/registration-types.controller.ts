import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegistrationTypesService } from './registration-types.service';
import { CreateRegistrationTypeDto } from './dto/create-registration-types.dto';
import { UpdateRegistrationTypeDto } from './dto/update-registration-types.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('registration-types')
export class RegistrationTypesController {
  constructor(
    private readonly registrationTypesService: RegistrationTypesService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new registration type' })
  @ApiResponse({
    status: 201,
    description: 'Registration type created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Registration type already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiQuery({
    name: 'conferenceId',
    description: 'ID of the conference to which the registration type belongs',
    required: true,
    type: String,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Query('conferenceId') conferenceId: string,
    @Body() registrationData: CreateRegistrationTypeDto,
  ) {
    return this.registrationTypesService.create(conferenceId, registrationData);
  }

  @ApiOperation({ summary: 'Get all registration types' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Registration types not found' })
  @ApiQuery({
    name: 'conferenceId',
    description: 'ID of the conference to which the registration types belong',
    required: true,
    type: String,
  })
  @Get()
  findAll(@Query('conferenceId') conferenceId: string) {
    return this.registrationTypesService.findAll(conferenceId);
  }

  @ApiOperation({ summary: 'Get a registration type by ID' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Registration type not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({
    name: 'id',
    description: 'Registration type ID',
    type: String,
    required: true,
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationTypesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a registration type' })
  @ApiResponse({
    status: 200,
    description: 'Registration type updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Registration type not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'id',
    description: 'Registration type ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() registrationData: UpdateRegistrationTypeDto,
  ) {
    return this.registrationTypesService.update(id, registrationData);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a registration type' })
  @ApiResponse({
    status: 200,
    description: 'Registration type deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Registration type not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiParam({
    name: 'id',
    description: 'Registration type ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationTypesService.remove(id);
  }
}
