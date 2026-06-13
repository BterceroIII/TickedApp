import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTickedDto } from './dto/create-ticked.dto';
import { UpdateTickedDto } from './dto/update-ticked.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { generateTicketId } from 'src/common/utils/ticket-id';
import { TicketWithProject } from './types/ticked-project.type';

@Injectable()
export class TickedsService {
  private readonly logger = new Logger(TickedsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTickedDto): Promise<TicketWithProject> {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Project #${dto.projectId} not found`);
    }

    const id = await generateTicketId(this.prisma);
    const ticket = await this.prisma.ticket.create({
      data: { ...dto, id },
      include: { project: { select: { id: true, name: true } } },
    });
    this.logger.log(`Ticket #${id} created successfully`);
    return ticket;
  }

  async findAll(): Promise<TicketWithProject[]> {
    const tickets = await this.prisma.ticket.findMany({
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    this.logger.log(`Retrieved all tickets`);
    return tickets;
  }

  async findOne(id: string): Promise<TicketWithProject> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { project: { select: { id: true, name: true } } },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    this.logger.log(`Retrieved ticket #${id}`);
    return ticket;
  }

  async update(id: string, dto: UpdateTickedDto): Promise<TicketWithProject> {
    const exists = await this.prisma.ticket.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: { project: { select: { id: true, name: true } } },
    });
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
}
