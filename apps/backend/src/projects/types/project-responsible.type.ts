import { Prisma } from "src/generated/prisma/client";

export type ProjectWithResponsible = Prisma.ProjectGetPayload<{
    include: {
      responsible: {
        select: {
          id: true;
          name: true;
          email: true;
        };
      };
    };
  }>;