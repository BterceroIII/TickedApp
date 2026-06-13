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

@Injectable()
export class TickedsService {
  private readonly logger = new Logger(TickedsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
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

  async update(
    id: string,
    dto: UpdateTickedDto,
  ): Promise<TicketWithProject> {
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
}
