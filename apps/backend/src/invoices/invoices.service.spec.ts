import { NotFoundException } from '@nestjs/common';
import { InvoiceStatus, UserRole } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  const currentUser = { id: 'user-1', role: UserRole.USER };
  const invoice = {
    id: 'INV-001',
    concept: 'Hosting',
    amount: 120,
    status: InvoiceStatus.PENDIENTE,
    dueDate: new Date('2026-06-20T00:00:00.000Z'),
    paidAt: null,
    userId: currentUser.id,
    createdAt: new Date('2026-06-13T00:00:00.000Z'),
    updatedAt: new Date('2026-06-13T00:00:00.000Z'),
  };

  it('creates an invoice for the current user', async () => {
    const prisma = {
      invoice: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(invoice),
      },
    };
    const service = new InvoicesService(prisma as unknown as PrismaService);

    await expect(
      service.create(
        {
          concept: invoice.concept,
          amount: 120,
          status: invoice.status,
          dueDate: invoice.dueDate,
        },
        currentUser,
      ),
    ).resolves.toMatchObject({ id: 'INV-001' });

    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: 'INV-001', user: { connect: { id: 'user-1' } } }),
      }),
    );
  });

  it('throws when an invoice is not owned by the current user', async () => {
    const prisma = { invoice: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new InvoicesService(prisma as unknown as PrismaService);

    await expect(service.findOne('INV-404', currentUser)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
