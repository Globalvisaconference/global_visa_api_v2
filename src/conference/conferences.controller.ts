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
import { ConferencesService } from './conferences.service';
import { CreateConferenceDto } from './dto/create-conferences.dto';
import { QueryConferenceDto } from './dto/query-conferences.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ConferenceStatus, Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('conferences')
export class ConferencesController {
  constructor(private conferencesService: ConferencesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new conference' })
  @ApiResponse({ status: 201, description: 'Place successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'conference already exists' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createConference(@Body() data: CreateConferenceDto) {
    return this.conferencesService.create(data);
  }

  @ApiOperation({ summary: 'Get all conferences' })
  @ApiResponse({ status: 200, description: 'OK', type: QueryConferenceDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Conferences not found' })
  @Get()
  getAllConferences(@Query() query: QueryConferenceDto) {
    return this.conferencesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a conference by ID' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Conference not found' })
  @ApiParam({
    name: 'id',
    description: 'Conference ID',
    type: String,
    required: true,
  })
  @Get(':id')
  getConferenceById(@Param('id') id: string) {
    return this.conferencesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a conference by ID' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Conference not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'Conference ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  updateConference(@Param('id') id: string, @Body() data: CreateConferenceDto) {
    return this.conferencesService.update(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update conference status' })
  @ApiResponse({
    status: 200,
    description: 'Conference status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Conference not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({
    name: 'id',
    description: 'Conference ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ConferenceStatus,
  ) {
    return this.conferencesService.updateStatus(id, status);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a conference' })
  @ApiResponse({ status: 200, description: 'Conference deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conference not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({
    name: 'id',
    description: 'Conference ID',
    type: String,
    required: true,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteConference(@Param('id') id: string) {
    return this.conferencesService.remove(id);
  }
}
