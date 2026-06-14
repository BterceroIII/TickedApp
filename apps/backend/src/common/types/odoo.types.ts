import { TicketPriority } from 'src/generated/prisma/client';

export type OdooRecord = Record<string, unknown>;

export type OdooCreateResult =
  | number
  | number[]
  | { id: number }
  | Array<{ id: number }>;

export type OdooCreateProjectInput = {
  name: string;
  description?: string | null;
  dateStart?: Date | null;
  dateLimit?: Date | null;
  responsibleEmail?: string | null;
};

export type OdooCreateTicketInput = {
  title: string;
  description?: string | null;
  priority?: TicketPriority;
  estimatedDate?: Date | null;
  assignedUserEmail?: string | null;
};

export type OdooCreateProjectTaskInput = OdooCreateTicketInput & {
  localTicketId: string;
  localProjectName: string;
  odooProjectId: number;
};

export type OdooUpdateProjectInput = OdooCreateProjectInput & {
  odooProjectId: number;
};

export type OdooUpdateTicketInput = OdooCreateTicketInput & {
  odooTicketId: number;
};

export type OdooUpdateProjectTaskInput = OdooCreateProjectTaskInput & {
  odooTaskId: number;
};
