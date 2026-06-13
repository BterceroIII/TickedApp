import { Prisma } from "src/generated/prisma/client";

export type TicketWithProject = Prisma.TicketGetPayload<{
    include: {
      project: {
        select: {
          id: true;
          name: true;
        };
      };
    };
  }>;
  