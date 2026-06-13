import { Prisma } from 'src/generated/prisma/client';

export const projectWithResponsibleInclude = {
  responsible: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectWithResponsible = Prisma.ProjectGetPayload<{
  include: typeof projectWithResponsibleInclude;
}>;
