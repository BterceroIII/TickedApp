import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectProgressDto } from './dto/project-progress.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, TicketStatus } from 'src/generated/prisma/client';

export type ProjectWithResponsible = Prisma.ProjectGetPayload<{
  include: {
    responsible: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<ProjectWithResponsible> {
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        responsible: { connect: { id: dto.responsible } },
      },
      include: {
        responsible: { select: { id: true, name: true, email: true } },
      },
    });
    this.logger.log(`Project created successfully`);
    return project;
  }

  async findAll(): Promise<ProjectWithResponsible[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        responsible: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    this.logger.log(`Retrieved all projects`);
    return projects;
  }

  async findProgress(): Promise<ProjectProgressDto[]> {
    const projects = await this.prisma.project.findMany({
      select: {
        id: true,
        tickets: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const progress = projects.map((project) => {
      const totalTickets = project.tickets.length;
      const resolvedTickets = project.tickets.filter(
        (ticket) => ticket.status === TicketStatus.RESUELTO,
      ).length;

      return {
        projectId: project.id,
        totalTickets,
        resolvedTickets,
        percentage:
          totalTickets > 0
            ? Math.round((resolvedTickets / totalTickets) * 100)
            : 0,
      };
    });

    this.logger.log(`Retrieved project progress`);
    return progress;
  }

  async findOne(id: number): Promise<ProjectWithResponsible> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        responsible: { select: { id: true, name: true, email: true } },
      },
    });
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    this.logger.log(`Retrieved project #${id}`);
    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectWithResponsible> {
    const { responsible, ...rest } = updateProjectDto;
    const data: Prisma.ProjectUpdateInput = {
      ...rest,
      ...(responsible ? { responsible: { connect: { id: responsible } } } : {}),
    };
    const exists = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    const project = await this.prisma.project.update({
      where: { id },
      data,
      include: {
        responsible: { select: { id: true, name: true, email: true } },
      },
    });
    this.logger.log(`Project #${id} updated successfully`);
    return project;
  }

  async remove(id: number): Promise<void> {
    const exists = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    await this.prisma.project.delete({
      where: { id },
    });
    this.logger.log(`Project #${id} deleted successfully`);
  }
}
