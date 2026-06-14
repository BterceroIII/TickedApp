import { ProjectStatus } from 'src/generated/prisma/client';
import { OdooService } from 'src/common/services/odoo.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const responsible = {
    id: 'user-1',
    name: 'Maria',
    email: 'maria@tickedapp.com',
  };
  const project = {
    id: 1,
    name: 'Portal cliente',
    description: 'Demo',
    status: ProjectStatus.EN_PROGRESO,
    responsibleId: responsible.id,
    responsible,
    dateLimit: new Date('2026-06-30T00:00:00.000Z'),
    createdAt: new Date('2026-06-13T00:00:00.000Z'),
    updatedAt: new Date('2026-06-13T00:00:00.000Z'),
    odooProjectId: null,
  };

  let prisma: { project: { create: jest.Mock; update: jest.Mock } };
  let notifications: { notifyProjectAssigned: jest.Mock };
  let odoo: { createProject: jest.Mock };
  let service: ProjectsService;

  beforeEach(() => {
    prisma = {
      project: {
        create: jest.fn().mockResolvedValue(project),
        update: jest
          .fn()
          .mockResolvedValue({ ...project, odooProjectId: 99 }),
      },
    };
    notifications = { notifyProjectAssigned: jest.fn().mockResolvedValue(null) };
    odoo = { createProject: jest.fn().mockResolvedValue(99) };
    service = new ProjectsService(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
      odoo as unknown as OdooService,
    );
  });

  it('creates a project locally and stores the Odoo project ID', async () => {
    await expect(
      service.create({
        name: project.name,
        description: project.description,
        responsible: responsible.id,
        dateLimit: project.dateLimit,
        status: project.status,
      }),
    ).resolves.toMatchObject({ id: 1, odooProjectId: 99 });

    expect(odoo.createProject).toHaveBeenCalledWith({
      name: project.name,
      description: project.description,
      dateStart: project.createdAt,
      dateLimit: project.dateLimit,
      responsibleEmail: responsible.email,
    });
    expect(prisma.project.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { odooProjectId: 99 } }),
    );
  });

  it('keeps the local project when Odoo sync fails', async () => {
    odoo.createProject.mockRejectedValueOnce(new Error('Odoo unavailable'));

    await expect(
      service.create({
        name: project.name,
        description: project.description,
        responsible: responsible.id,
        dateLimit: project.dateLimit,
        status: project.status,
      }),
    ).resolves.toMatchObject({ id: 1, odooProjectId: null });

    expect(prisma.project.update).not.toHaveBeenCalled();
  });
});
