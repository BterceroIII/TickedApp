import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTickedDto } from './dto/create-ticked.dto';
import { UpdateTickedDto } from './dto/update-ticked.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Ticket } from 'src/generated/prisma/client';
import { generateTicketId } from 'src/common/utils/ticket-id';

@Injectable()
export class TickedsService {
  private readonly logger = new Logger(TickedsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTickedDto): Promise<Ticket> {
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
    });
    this.logger.log(`Ticket #${id} created successfully`);
    return ticket;
  }

  async findAll(): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany();
    this.logger.log(`Retrieved all tickets`);
    return tickets;
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
    this.logger.log(`Retrieved ticket #${id}`);
    return ticket;
  }

  async update(id: string, dto: UpdateTickedDto): Promise<Ticket> {
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
