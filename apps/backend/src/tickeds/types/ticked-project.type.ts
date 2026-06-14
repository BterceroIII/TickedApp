import { Prisma } from 'src/generated/prisma/client';

export const ticketWithProjectInclude = {
  project: {
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      dateLimit: true,
      odooProjectId: true,
      responsible: { select: { email: true } },
    },
  },
  assignedTo: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TicketInclude;

export type TicketWithProject = Prisma.TicketGetPayload<{
  include: typeof ticketWithProjectInclude;
}>;
