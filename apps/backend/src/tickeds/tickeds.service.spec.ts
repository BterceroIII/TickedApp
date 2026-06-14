import {
  ProjectStatus,
  TicketPriority,
  TicketStatus,
} from 'src/generated/prisma/client';
import { OdooService } from 'src/common/services/odoo.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TickedsService } from './tickeds.service';

describe('TickedsService', () => {
  const project = {
    id: 1,
    name: 'Portal cliente',
    description: 'Demo',
    status: ProjectStatus.EN_PROGRESO,
    responsibleId: 'user-1',
    dateLimit: new Date('2026-06-30T00:00:00.000Z'),
    createdAt: new Date('2026-06-13T00:00:00.000Z'),
    updatedAt: new Date('2026-06-13T00:00:00.000Z'),
    odooProjectId: 55,
    responsible: { email: 'owner@tickedapp.com' },
  };
  const ticket = {
    id: 'TK-001',
    projectId: project.id,
    title: 'Error de acceso',
    description: 'No puedo entrar',
    status: TicketStatus.ABIERTO,
    priority: TicketPriority.ALTA,
    estimatedDate: new Date('2026-06-20T00:00:00.000Z'),
    assignedToId: 'user-2',
    createdAt: new Date('2026-06-13T00:00:00.000Z'),
    updatedAt: new Date('2026-06-13T00:00:00.000Z'),
    odooTicketId: null,
    odooTaskId: null,
    project,
    assignedTo: {
      id: 'user-2',
      name: 'Agent',
      email: 'agent@tickedapp.com',
    },
  };

  let prisma: {
    project: { findUnique: jest.Mock; update: jest.Mock };
    ticket: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    user: { findUnique: jest.Mock };
  };
  let notifications: { notifyTicketAssigned: jest.Mock };
  let odoo: {
    createTicket: jest.Mock;
    createProjectTask: jest.Mock;
    createProject: jest.Mock;
  };
  let service: TickedsService;

  beforeEach(() => {
    prisma = {
      project: {
        findUnique: jest.fn().mockResolvedValue({ id: project.id }),
        update: jest.fn(),
      },
      ticket: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(ticket),
        update: jest.fn(),
      },
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-2' }) },
    };
    notifications = { notifyTicketAssigned: jest.fn().mockResolvedValue(null) };
    odoo = {
      createTicket: jest.fn().mockResolvedValue(10),
      createProjectTask: jest.fn().mockResolvedValue(11),
      createProject: jest.fn(),
    };
    service = new TickedsService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
      odoo as unknown as OdooService,
    );
  });

  it('creates a ticket and stores Odoo ticket and task IDs', async () => {
    await expect(
      service.create({
        projectId: project.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        estimatedDate: ticket.estimatedDate,
        assignedToId: ticket.assignedToId,
      }),
    ).resolves.toMatchObject({ id: 'TK-001' });

    expect(odoo.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({ assignedUserEmail: 'agent@tickedapp.com' }),
    );
    expect(odoo.createProjectTask).toHaveBeenCalledWith(
      expect.objectContaining({ odooProjectId: 55, estimatedDate: ticket.estimatedDate }),
    );
    expect(prisma.ticket.update).toHaveBeenCalledWith({
      where: { id: ticket.id },
      data: { odooTicketId: 10 },
    });
    expect(prisma.ticket.update).toHaveBeenCalledWith({
      where: { id: ticket.id },
      data: { odooTaskId: 11 },
    });
  });

  it('throws when the project does not exist', async () => {
    prisma.project.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.create({
        projectId: 999,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        estimatedDate: ticket.estimatedDate,
      }),
    ).rejects.toThrow('Project #999 not found');
  });
});
