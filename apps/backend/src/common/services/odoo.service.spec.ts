import { ConfigService } from '@nestjs/config';
import { TicketPriority } from 'src/generated/prisma/client';
import { OdooService } from './odoo.service';

describe('OdooService', () => {
  const configValues: Record<string, string> = {
    ODOO_API_KEY: 'test-api-key',
    ODOO_DATABASE: 'test-database',
    ODOO_URL: 'https://test.odoo.com/',
  };

  let service: OdooService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    const configService = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as ConfigService;

    service = new OdooService(configService);
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a project using the Odoo JSON-2 API', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse('[{"id":9,"login":"admin@test.com"}]'))
      .mockResolvedValueOnce(jsonResponse('123'));

    await expect(
      service.createProject({
        name: 'Proyecto demo',
        description: 'Proyecto de prueba',
        dateStart: new Date('2026-06-13T12:00:00.000Z'),
        dateLimit: new Date('2026-06-30T12:00:00.000Z'),
        responsibleEmail: 'admin@test.com',
      }),
    ).resolves.toBe(123);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://test.odoo.com/json/2/res.users/search_read',
      expect.objectContaining({
        body: JSON.stringify({
          domain: ['|', ['login', '=', 'admin@test.com'], ['email', '=', 'admin@test.com']],
          fields: ['id', 'login', 'email'],
          limit: 1,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://test.odoo.com/json/2/project.project/create',
      {
        method: 'POST',
        headers: {
          Authorization: 'bearer test-api-key',
          'Content-Type': 'application/json',
          'X-Odoo-Database': 'test-database',
        },
        body: JSON.stringify({
          vals_list: [
            {
              name: 'Proyecto demo',
              description: 'Proyecto de prueba\n\nResponsable TickedApp: admin@test.com',
              date_start: '2026-06-13',
              date: '2026-06-30',
              user_id: 9,
            },
          ],
        }),
      },
    );
  });

  it('creates a ticket with the first available helpdesk team', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse('[{"id":7,"name":"Soporte"}]'))
      .mockResolvedValueOnce(jsonResponse('[{"id":10,"login":"agent@test.com"}]'))
      .mockResolvedValueOnce(
        jsonResponse('{"email_from":{"type":"char"},"partner_email":{"type":"char"}}'),
      )
      .mockResolvedValueOnce(jsonResponse('456'));

    await expect(
      service.createTicket({
        title: 'Error de acceso',
        description: 'No puedo iniciar sesion',
        priority: TicketPriority.ALTA,
        assignedUserEmail: 'agent@test.com',
      }),
    ).resolves.toBe(456);

    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'https://test.odoo.com/json/2/helpdesk.ticket/create',
      expect.objectContaining({
        body: JSON.stringify({
          vals_list: [
            {
              name: 'Error de acceso',
              description: 'No puedo iniciar sesion\n\nAsignado TickedApp: agent@test.com',
              email_from: 'agent@test.com',
              partner_email: 'agent@test.com',
              team_id: 7,
              priority: '3',
              user_id: 10,
            },
          ],
        }),
      }),
    );
  });

  it('creates a project task linked to a persisted Odoo project ID', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse('[{"id":10,"login":"agent@test.com"}]'))
      .mockResolvedValueOnce(jsonResponse('{"email_from":{"type":"char"}}'))
      .mockResolvedValueOnce(jsonResponse('789'));

    await expect(
      service.createProjectTask({
        localTicketId: 'TK-004',
        localProjectName: 'Portal cliente',
        odooProjectId: 12,
        title: 'Revisar formulario',
        description: 'El formulario no valida correctamente',
        priority: TicketPriority.MEDIA,
        estimatedDate: new Date('2026-06-12T18:00:00.000Z'),
        assignedUserEmail: 'agent@test.com',
      }),
    ).resolves.toBe(789);

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://test.odoo.com/json/2/project.task/create',
      expect.objectContaining({
        body: JSON.stringify({
          vals_list: [
            {
              name: 'Revisar formulario',
              description:
                'El formulario no valida correctamente\n\nOrigen: TickedApp\nTicket local: TK-004\nProyecto local: Portal cliente\nAsignado TickedApp: agent@test.com',
              project_id: 12,
              email_from: 'agent@test.com',
              priority: '2',
              date_deadline: '2026-06-12 18:00:00',
              user_ids: [[6, 0, [10]]],
            },
          ],
        }),
      }),
    );
  });
});

function jsonResponse(text: string): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(text),
  } as Response;
}
