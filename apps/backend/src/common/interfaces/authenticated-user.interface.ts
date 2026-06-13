import type { UserRole } from 'src/generated/prisma/client';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}
