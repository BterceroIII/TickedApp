import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('creates and returns a notification', async () => {
    const notification = { id: 1, userId: 'user-1', title: 'Hola' };
    const prisma = {
      notification: { create: jest.fn().mockResolvedValue(notification) },
    };
    const service = new NotificationsService(prisma as unknown as PrismaService);

    await expect(
      service.create({ userId: 'user-1', title: 'Hola', message: 'Demo' }),
    ).resolves.toBe(notification);
  });

  it('prevents marking notifications from another user', async () => {
    const prisma = {
      notification: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, userId: 'other' }),
      },
    };
    const service = new NotificationsService(prisma as unknown as PrismaService);

    await expect(service.markAsRead(1, 'user-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
