import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TickedsService } from './tickeds.service';

import { CreateTickedDto } from './dto/create-ticked.dto';
import { UpdateTickedDto } from './dto/update-ticked.dto';
import { TicketWithProject } from './types/ticked-project.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, type User } from 'src/generated/prisma/client';

@ApiTags('Tickeds')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('tickeds')
export class TickedsController {
  constructor(private readonly tickedsService: TickedsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTickedDto: CreateTickedDto): Promise<TicketWithProject> {
    return this.tickedsService.create(createTickedDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  findAll(@CurrentUser() user: User): Promise<TicketWithProject[]> {
    return this.tickedsService.findAll(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket found' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<TicketWithProject> {
    return this.tickedsService.findOne(id, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(
    @Param('id') id: string,
    @Body() updateTickedDto: UpdateTickedDto,
  ): Promise<TicketWithProject> {
    return this.tickedsService.update(id, updateTickedDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({ status: 204, description: 'Ticket deleted' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.tickedsService
      .remove(id)
      .then(() => ({ message: 'Ticket deleted successfully' }));
  }
}
