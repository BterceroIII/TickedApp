import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTickedDto } from './dto/create-ticked.dto';
import { UpdateTickedDto } from './dto/update-ticked.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'src/generated/prisma/client';
import { generateTicketId } from 'src/common/utils/ticket-id';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import {
  ticketWithProjectInclude,
  TicketWithProject,
} from './types/ticked-project.type';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OdooService } from 'src/common/services/odoo.service';

@Injectable()
export class TickedsService {
  private readonly logger = new Logger(TickedsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly odooService: OdooService,
  ) {}

  async create(dto: CreateTickedDto): Promise<TicketWithProject> {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Project #${dto.projectId} not found`);
    }

    if (dto.assignedToId) {
      await this.ensureAssignedUserExists(dto.assignedToId);
    }

    const id = await generateTicketId(this.prisma);
    const ticket = await this.prisma.ticket.create({
      data: { ...dto, id },
      include: ticketWithProjectInclude,
    });
    if (dto.assignedToId) {
      await this.notificationsService.notifyTicketAssigned({
        userId: dto.assignedToId,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        projectId: ticket.projectId,
      });
    }
    await this.syncTicketWithOdoo(ticket);
    this.logger.log(`Ticket #${id} created successfully`);
    return ticket;
  }

  async findAll(currentUser: AuthenticatedUser): Promise<TicketWithProject[]> {
    const tickets = await this.prisma.ticket.findMany({
      where:
        currentUser.role === UserRole.ADMIN
          ? undefined
          : { assignedToId: currentUser.id },
      include: ticketWithProjectInclude,
      orderBy: { createdAt: 'desc' },
    });
    this.logger.log(`Retrieved all tickets`);
    return tickets;
  }

  async findOne(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<TicketWithProject> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketWithProjectInclude,
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    this.ensureCanAccessTicket(currentUser, ticket.assignedToId);
    this.logger.log(`Retrieved ticket #${id}`);
    return ticket;
  }

  async update(id: string, dto: UpdateTickedDto): Promise<TicketWithProject> {
    const exists = await this.prisma.ticket.findUnique({
      where: { id },
      select: { id: true, assignedToId: true },
    });
    if (!exists) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    if (dto.assignedToId) {
      await this.ensureAssignedUserExists(dto.assignedToId);
    }

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: ticketWithProjectInclude,
    });
    if (dto.assignedToId && dto.assignedToId !== exists.assignedToId) {
      await this.notificationsService.notifyTicketAssigned({
        userId: dto.assignedToId,
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        projectId: ticket.projectId,
      });
    }
    await this.syncTicketUpdateWithOdoo(ticket);
    this.logger.log(`Ticket #${id} updated successfully`);
    return ticket;
  }

  async remove(id: string): Promise<void> {
    const exists = await this.prisma.ticket.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    await this.prisma.ticket.delete({
      where: { id },
    });
    this.logger.log(`Ticket #${id} deleted successfully`);
  }

  private ensureCanAccessTicket(
    currentUser: AuthenticatedUser,
    assignedToId: string | null,
  ): void {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only access assigned tickets');
    }
  }

  private async ensureAssignedUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Assigned user #${userId} not found`);
    }
  }

  private async syncTicketWithOdoo(ticket: TicketWithProject): Promise<void> {
    try {
      const odooTicketId = await this.odooService.createTicket({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        assignedUserEmail: ticket.assignedTo?.email,
      });

      if (odooTicketId) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { odooTicketId },
        });
        this.logger.log(
          `Ticket #${ticket.id} synced with Odoo #${odooTicketId}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Ticket #${ticket.id} created locally but Odoo sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      const odooProjectId = await this.ensureOdooProjectId(
        ticket.project.id,
        ticket.project.name,
        ticket.project.description,
        ticket.project.createdAt,
        ticket.project.dateLimit,
        ticket.project.responsible.email,
        ticket.project.odooProjectId,
      );

      if (!odooProjectId) {
        this.logger.warn(
          `Ticket #${ticket.id} was not synced as an Odoo task because project #${ticket.project.id} has no Odoo ID`,
        );
        return;
      }

      const odooTaskId = await this.odooService.createProjectTask({
        localTicketId: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        estimatedDate: ticket.estimatedDate,
        assignedUserEmail: ticket.assignedTo?.email,
        localProjectName: ticket.project.name,
        odooProjectId,
      });

      if (odooTaskId) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { odooTaskId },
        });
        this.logger.log(
          `Ticket #${ticket.id} synced as Odoo project task #${odooTaskId}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Ticket #${ticket.id} created locally but Odoo task sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async syncTicketUpdateWithOdoo(
    ticket: TicketWithProject,
  ): Promise<void> {
    try {
      if (ticket.odooTicketId) {
        const updated = await this.odooService.updateTicket({
          odooTicketId: ticket.odooTicketId,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          assignedUserEmail: ticket.assignedTo?.email,
        });

        if (updated) {
          this.logger.log(
            `Ticket #${ticket.id} updated in Odoo helpdesk #${ticket.odooTicketId}`,
          );
        }
      } else {
        const odooTicketId = await this.odooService.createTicket({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          assignedUserEmail: ticket.assignedTo?.email,
        });

        if (odooTicketId) {
          await this.prisma.ticket.update({
            where: { id: ticket.id },
            data: { odooTicketId },
          });
          this.logger.log(
            `Ticket #${ticket.id} synced with Odoo helpdesk #${odooTicketId} after update`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Ticket #${ticket.id} updated locally but Odoo helpdesk update failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      const odooProjectId = await this.ensureOdooProjectId(
        ticket.project.id,
        ticket.project.name,
        ticket.project.description,
        ticket.project.createdAt,
        ticket.project.dateLimit,
        ticket.project.responsible.email,
        ticket.project.odooProjectId,
      );

      if (!odooProjectId) {
        this.logger.warn(
          `Ticket #${ticket.id} task was not updated because project #${ticket.project.id} has no Odoo ID`,
        );
        return;
      }

      if (ticket.odooTaskId) {
        const updated = await this.odooService.updateProjectTask({
          odooTaskId: ticket.odooTaskId,
          localTicketId: ticket.id,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          estimatedDate: ticket.estimatedDate,
          assignedUserEmail: ticket.assignedTo?.email,
          localProjectName: ticket.project.name,
          odooProjectId,
        });

        if (updated) {
          this.logger.log(
            `Ticket #${ticket.id} updated in Odoo project task #${ticket.odooTaskId}`,
          );
        }
        return;
      }

      const odooTaskId = await this.odooService.createProjectTask({
        localTicketId: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        estimatedDate: ticket.estimatedDate,
        assignedUserEmail: ticket.assignedTo?.email,
        localProjectName: ticket.project.name,
        odooProjectId,
      });

      if (odooTaskId) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { odooTaskId },
        });
        this.logger.log(
          `Ticket #${ticket.id} synced as Odoo project task #${odooTaskId} after update`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Ticket #${ticket.id} updated locally but Odoo task update failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async ensureOdooProjectId(
    projectId: number,
    projectName: string,
    projectDescription: string | null,
    projectCreatedAt: Date,
    projectDateLimit: Date,
    responsibleEmail: string,
    odooProjectId: number | null,
  ): Promise<number | null> {
    if (odooProjectId) {
      return odooProjectId;
    }

    const newOdooProjectId = await this.odooService.createProject({
      name: projectName,
      description: projectDescription,
      dateStart: projectCreatedAt,
      dateLimit: projectDateLimit,
      responsibleEmail,
    });

    if (!newOdooProjectId) {
      return null;
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { odooProjectId: newOdooProjectId },
    });

    this.logger.log(
      `Project #${projectId} synced with Odoo #${newOdooProjectId} before creating task`,
    );

    return newOdooProjectId;
  }
}
