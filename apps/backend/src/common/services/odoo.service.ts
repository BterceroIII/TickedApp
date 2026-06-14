import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TicketPriority } from 'src/generated/prisma/client';
import {
  OdooCreateProjectInput,
  OdooCreateProjectTaskInput,
  OdooCreateResult,
  OdooCreateTicketInput,
  OdooRecord,
  OdooUpdateProjectInput,
  OdooUpdateProjectTaskInput,
  OdooUpdateTicketInput,
} from 'src/common/types/odoo.types';
import { getOdooConfig, OdooConfig } from '../config/odoo.config';

@Injectable()
export class OdooService {
  private readonly logger = new Logger(OdooService.name);

  constructor(private readonly configService: ConfigService) {}

  async createProject(input: OdooCreateProjectInput): Promise<number | null> {
    const config = this.getConfig();
    if (!config) {
      return null;
    }

    const userId = await this.findUserIdByEmail(config, input.responsibleEmail);
    const vals: OdooRecord = {
      name: input.name,
      description: this.buildProjectDescription(input),
    };

    if (input.dateStart) {
      vals.date_start = this.formatOdooDate(input.dateStart);
    }

    if (input.dateLimit) {
      vals.date = this.formatOdooDate(input.dateLimit);
    }

    if (userId) {
      vals.user_id = userId;
    }

    const result = await this.call<OdooCreateResult>(
      config,
      'project.project',
      'create',
      {
        vals_list: [vals],
      },
    );

    return this.getCreatedId(result);
  }

  async createTicket(input: OdooCreateTicketInput): Promise<number | null> {
    const config = this.getConfig();
    if (!config) {
      return null;
    }

    const teamId = await this.findFirstHelpdeskTeamId(config);
    const userId = await this.findUserIdByEmail(
      config,
      input.assignedUserEmail,
    );
    const vals: OdooRecord = {
      name: input.title,
      description: this.buildTicketDescription(input),
    };
    await this.addEmailFieldsIfAvailable(
      config,
      'helpdesk.ticket',
      vals,
      input.assignedUserEmail,
    );

    if (teamId) {
      vals.team_id = teamId;
    }

    if (input.priority) {
      vals.priority = this.mapTicketPriority(input.priority);
    }

    if (userId) {
      vals.user_id = userId;
    }

    const result = await this.call<OdooCreateResult>(
      config,
      'helpdesk.ticket',
      'create',
      {
        vals_list: [vals],
      },
    );

    return this.getCreatedId(result);
  }

  async updateProject(input: OdooUpdateProjectInput): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      return false;
    }

    const userId = await this.findUserIdByEmail(config, input.responsibleEmail);
    const vals: OdooRecord = {
      name: input.name,
      description: this.buildProjectDescription(input),
    };

    if (input.dateStart) {
      vals.date_start = this.formatOdooDate(input.dateStart);
    }

    if (input.dateLimit) {
      vals.date = this.formatOdooDate(input.dateLimit);
    }

    if (userId) {
      vals.user_id = userId;
    }

    return this.write(config, 'project.project', input.odooProjectId, vals);
  }

  async updateTicket(input: OdooUpdateTicketInput): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      return false;
    }

    const userId = await this.findUserIdByEmail(
      config,
      input.assignedUserEmail,
    );
    const vals: OdooRecord = {
      name: input.title,
      description: this.buildTicketDescription(input),
    };

    await this.addEmailFieldsIfAvailable(
      config,
      'helpdesk.ticket',
      vals,
      input.assignedUserEmail,
    );

    if (input.priority) {
      vals.priority = this.mapTicketPriority(input.priority);
    }

    if (userId) {
      vals.user_id = userId;
    }

    return this.write(config, 'helpdesk.ticket', input.odooTicketId, vals);
  }

  async createProjectTask(
    input: OdooCreateProjectTaskInput,
  ): Promise<number | null> {
    const config = this.getConfig();
    if (!config) {
      return null;
    }

    const vals: OdooRecord = {
      name: input.title,
      description: this.buildTaskDescription(input),
      project_id: input.odooProjectId,
    };
    const userId = await this.findUserIdByEmail(
      config,
      input.assignedUserEmail,
    );
    await this.addEmailFieldsIfAvailable(
      config,
      'project.task',
      vals,
      input.assignedUserEmail,
    );

    if (input.priority) {
      vals.priority = this.mapTicketPriority(input.priority);
    }

    if (input.estimatedDate) {
      vals.date_deadline = this.formatOdooDateTime(input.estimatedDate);
    }

    if (userId) {
      vals.user_ids = [[6, 0, [userId]]];
    }

    const result = await this.call<OdooCreateResult>(
      config,
      'project.task',
      'create',
      {
        vals_list: [vals],
      },
    );

    return this.getCreatedId(result);
  }

  async updateProjectTask(input: OdooUpdateProjectTaskInput): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      return false;
    }

    const vals: OdooRecord = {
      name: input.title,
      description: this.buildTaskDescription(input),
      project_id: input.odooProjectId,
    };
    const userId = await this.findUserIdByEmail(
      config,
      input.assignedUserEmail,
    );

    await this.addEmailFieldsIfAvailable(
      config,
      'project.task',
      vals,
      input.assignedUserEmail,
    );

    if (input.priority) {
      vals.priority = this.mapTicketPriority(input.priority);
    }

    if (input.estimatedDate) {
      vals.date_deadline = this.formatOdooDateTime(input.estimatedDate);
    }

    if (userId) {
      vals.user_ids = [[6, 0, [userId]]];
    }

    return this.write(config, 'project.task', input.odooTaskId, vals);
  }

  async searchRead(
    model: string,
    domain: unknown[] = [],
    fields: string[] = ['id', 'name'],
    limit = 10,
  ): Promise<OdooRecord[]> {
    const config = this.getConfig();
    if (!config) {
      return [];
    }

    return this.call<OdooRecord[]>(config, model, 'search_read', {
      domain,
      fields,
      limit,
    });
  }

  private async findFirstHelpdeskTeamId(
    config: OdooConfig,
  ): Promise<number | null> {
    try {
      const teams = await this.call<Array<{ id: number }>>(
        config,
        'helpdesk.team',
        'search_read',
        {
          domain: [],
          fields: ['id', 'name'],
          limit: 1,
        },
      );

      return teams[0]?.id ?? null;
    } catch (error) {
      this.logger.warn(
        `Could not resolve Odoo helpdesk team: ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  private async findUserIdByEmail(
    config: OdooConfig,
    email?: string | null,
  ): Promise<number | null> {
    if (!email) {
      return null;
    }

    try {
      const users = await this.call<Array<{ id: number }>>(
        config,
        'res.users',
        'search_read',
        {
          domain: ['|', ['login', '=', email], ['email', '=', email]],
          fields: ['id', 'login', 'email'],
          limit: 1,
        },
      );

      return users[0]?.id ?? null;
    } catch (error) {
      this.logger.warn(
        `Could not resolve Odoo user "${email}": ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  private async addEmailFieldsIfAvailable(
    config: OdooConfig,
    model: string,
    vals: OdooRecord,
    email?: string | null,
  ): Promise<void> {
    if (!email) {
      return;
    }

    const fields = await this.getModelFields(config, model);

    for (const field of ['email_from', 'partner_email']) {
      if (fields.has(field)) {
        vals[field] = email;
      }
    }
  }

  private async getModelFields(
    config: OdooConfig,
    model: string,
  ): Promise<Set<string>> {
    try {
      const fields = await this.call<Record<string, unknown>>(
        config,
        model,
        'fields_get',
        {
          attributes: ['type'],
        },
      );

      return new Set(Object.keys(fields));
    } catch (error) {
      this.logger.warn(
        `Could not resolve Odoo fields for ${model}: ${this.getErrorMessage(error)}`,
      );
      return new Set();
    }
  }

  private getCreatedId(result: OdooCreateResult): number | null {
    if (typeof result === 'number') {
      return result;
    }

    if (Array.isArray(result)) {
      const first = result[0];

      if (typeof first === 'number') {
        return first;
      }

      if (first && typeof first === 'object' && 'id' in first) {
        return Number(first.id);
      }
    }

    if (result && typeof result === 'object' && 'id' in result) {
      return Number(result.id);
    }

    return null;
  }

  private async call<T>(
    config: OdooConfig,
    model: string,
    method: string,
    body: OdooRecord,
  ): Promise<T> {
    const response = await fetch(`${config.url}/json/2/${model}/${method}`, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Odoo-Database': config.database,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      throw new Error(
        `Odoo ${model}.${method} returned a non-JSON response (${response.status}, ${contentType || 'unknown content-type'}): ${this.truncate(text)}`,
      );
    }

    const payload = text ? this.parseJson(text, model, method) : null;

    if (!response.ok) {
      throw new Error(
        `Odoo ${model}.${method} failed with ${response.status}: ${JSON.stringify(payload)}`,
      );
    }

    return payload as T;
  }

  private async write(
    config: OdooConfig,
    model: string,
    id: number,
    vals: OdooRecord,
  ): Promise<boolean> {
    return this.call<boolean>(config, model, 'write', {
      ids: [id],
      vals,
    });
  }

  private getConfig(): OdooConfig | null {
    const config = getOdooConfig(this.configService);

    if (!config) {
      this.logger.warn(
        'Odoo integration skipped because ODOO_URL, ODOO_DATABASE or ODOO_API_KEY is missing',
      );
    }

    return config;
  }

  private mapTicketPriority(priority: TicketPriority): string {
    const priorities: Record<TicketPriority, string> = {
      [TicketPriority.ALTA]: '3',
      [TicketPriority.MEDIA]: '2',
      [TicketPriority.BAJA]: '1',
    };

    return priorities[priority];
  }

  private formatOdooDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatOdooDateTime(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private buildProjectDescription(input: OdooCreateProjectInput): string {
    const description = input.description?.trim()
      ? input.description.trim()
      : 'Sin descripcion';

    if (!input.responsibleEmail) {
      return description;
    }

    return `${description}\n\nResponsable TickedApp: ${input.responsibleEmail}`;
  }

  private buildTicketDescription(input: OdooCreateTicketInput): string {
    const description = input.description?.trim()
      ? input.description.trim()
      : 'Sin descripcion';

    if (!input.assignedUserEmail) {
      return description;
    }

    return `${description}\n\nAsignado TickedApp: ${input.assignedUserEmail}`;
  }

  private buildTaskDescription(input: OdooCreateProjectTaskInput): string {
    const description = input.description?.trim()
      ? input.description.trim()
      : 'Sin descripcion';

    return `${description}\n\nOrigen: TickedApp\nTicket local: ${input.localTicketId}\nProyecto local: ${input.localProjectName}${input.assignedUserEmail ? `\nAsignado TickedApp: ${input.assignedUserEmail}` : ''}`;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private parseJson(text: string, model: string, method: string): unknown {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new Error(
        `Odoo ${model}.${method} returned invalid JSON: ${this.truncate(text)}`,
      );
    }
  }

  private truncate(text: string): string {
    return text.length > 200 ? `${text.slice(0, 200)}...` : text;
  }
}
