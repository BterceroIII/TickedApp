import { PrismaClient } from 'src/generated/prisma/client';
import { generateSequentialId } from './sequential-id';

export async function generateInvoiceId(prisma: PrismaClient): Promise<string> {
  return generateSequentialId({
    prefix: 'INV',
    findLast: () =>
      prisma.invoice.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
  });
}
