import {
  InvoiceStatus,
  ProjectStatus,
  TicketPriority,
  TicketStatus,
  UserRole,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('builds dashboard metrics and recent activity for the current user', async () => {
    const prisma = {
      project: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      ticket: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      invoice: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn().mockResolvedValue([
        2,
        3,
        1,
        4,
        5,
        [
          {
            id: 1,
            name: 'Portal',
            status: ProjectStatus.EN_PROGRESO,
            dateLimit: new Date('2026-06-30T00:00:00.000Z'),
            tickets: [
              { status: TicketStatus.RESUELTO },
              { status: TicketStatus.ABIERTO },
            ],
          },
        ],
        [
          {
            id: 'TK-001',
            title: 'Bug',
            status: TicketStatus.ABIERTO,
            priority: TicketPriority.ALTA,
            createdAt: new Date('2026-06-13T00:00:00.000Z'),
            project: { name: 'Portal' },
          },
        ],
        [
          {
            id: 'INV-001',
            concept: 'Hosting',
            amount: 120,
            status: InvoiceStatus.PENDIENTE,
            dueDate: new Date('2026-06-20T00:00:00.000Z'),
          },
        ],
      ]),
    };
    const service = new DashboardService(prisma as unknown as PrismaService);

    await expect(
      service.getSummary({ id: 'user-1', role: UserRole.USER }),
    ).resolves.toMatchObject({
      metrics: [
        { label: 'Proyectos activos', value: 2 },
        { label: 'Tickets abiertos', value: 3, helper: '5 en proceso' },
        { label: 'Facturas pendientes', value: 4 },
      ],
      activeProjects: [{ id: 1, progress: 50 }],
      recentTickets: [{ id: 'TK-001', projectName: 'Portal' }],
      recentInvoices: [{ id: 'INV-001', amount: 120 }],
    });
  });
});
