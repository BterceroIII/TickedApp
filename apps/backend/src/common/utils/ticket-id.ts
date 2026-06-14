import { PrismaClient } from 'src/generated/prisma/client';
import { generateSequentialId } from './sequential-id';

export async function generateTicketId(prisma: PrismaClient): Promise<string> {
  return generateSequentialId({
    prefix: 'TK',
    findLast: () =>
      prisma.ticket.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      }),
  });
}
