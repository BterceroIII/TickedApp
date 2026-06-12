import { PrismaClient } from 'src/generated/prisma/client';

export async function generateTicketId(prisma: PrismaClient): Promise<string> {
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });

  let nextNumber = 1;

  if (lastTicket) {
    const match = lastTicket.id.match(/TK-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `TK-${String(nextNumber).padStart(3, '0')}`;
}
