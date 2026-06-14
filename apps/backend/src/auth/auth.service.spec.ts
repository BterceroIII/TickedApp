import { NotFoundException } from '@nestjs/common';
import { EmailsService } from 'src/emails/emails.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('returns the current user profile', async () => {
    const user = {
      id: 'user-1',
      name: 'Maria',
      email: 'maria@tickedapp.com',
      role: 'USER',
    };
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(user) } };
    const service = new AuthService(
      prisma as unknown as PrismaService,
      {} as EmailsService,
    );

    await expect(service.getUser('user-1')).resolves.toBe(user);
  });

  it('throws when the current user does not exist', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new AuthService(
      prisma as unknown as PrismaService,
      {} as EmailsService,
    );

    await expect(service.getUser('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
