import { Controller, Get, HttpCode, HttpStatus, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { User } from 'src/generated/prisma/client';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(+id, user.id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
