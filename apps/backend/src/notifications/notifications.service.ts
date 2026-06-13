import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationInput } from './types/create-notification-input.type';



@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyProjectAssigned(input: {
    userId: string;
    projectId: number;
    projectName: string;
  }) {
    return this.create({
      userId: input.userId,
      projectId: input.projectId,
      title: 'Proyecto asignado',
      message: `Te asignaron el proyecto ${input.projectName}`,
    });
  }

  async notifyTicketAssigned(input: {
    userId: string;
    ticketId: string;
    ticketTitle: string;
    projectId: number;
  }) {
    return this.create({
      userId: input.userId,
      ticketId: input.ticketId,
      projectId: input.projectId,
      title: 'Ticket asignado',
      message: `Te asignaron el ticket ${input.ticketId}: ${input.ticketTitle}`,
    });
  }

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: input,
    });

    this.logger.log(`Notification #${notification.id} created successfully`);
    return notification;
  }

  async findAll(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Retrieved notifications for user #${userId}`);
    return notifications;
  }

  async markAsRead(id: number, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!notification) {
      throw new NotFoundException(`Notification #${id} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only update your notifications');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return this.findAll(userId);
  }
}
