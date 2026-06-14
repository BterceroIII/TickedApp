import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectProgressDto } from './dto/project-progress.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, TicketStatus, UserRole } from 'src/generated/prisma/client';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import {
  projectWithResponsibleInclude,
  ProjectWithResponsible,
} from './types/project-responsible.type';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OdooService } from 'src/common/services/odoo.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly odooService: OdooService,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectWithResponsible> {
    let project = await this.prisma.project.create({
      data: {
        ...dto,
        responsible: { connect: { id: dto.responsible } },
      },
      include: projectWithResponsibleInclude,
    });
    await this.notificationsService.notifyProjectAssigned({
      userId: dto.responsible,
      projectId: project.id,
      projectName: project.name,
    });
    const odooProjectId = await this.syncProjectWithOdoo(project);
    if (odooProjectId) {
      project = await this.prisma.project.update({
        where: { id: project.id },
        data: { odooProjectId },
        include: projectWithResponsibleInclude,
      });
    }
    this.logger.log(`Project created successfully`);
    return project;
  }

  async findAll(
    currentUser: AuthenticatedUser,
  ): Promise<ProjectWithResponsible[]> {
    const projects = await this.prisma.project.findMany({
      where: this.getUserProjectWhere(currentUser),
      include: projectWithResponsibleInclude,
      orderBy: { createdAt: 'desc' },
    });
    this.logger.log(`Retrieved all projects`);
    return projects;
  }

  async findProgress(
    currentUser: AuthenticatedUser,
  ): Promise<ProjectProgressDto[]> {
    const projects = await this.prisma.project.findMany({
      where: this.getUserProjectWhere(currentUser),
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

  async findOne(
    id: number,
    currentUser: AuthenticatedUser,
  ): Promise<ProjectWithResponsible> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: projectWithResponsibleInclude,
    });
    if (!project) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    await this.ensureCanAccessProject(id, currentUser);
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
      select: { id: true, responsibleId: true },
    });
    if (!exists) {
      throw new NotFoundException(`Project #${id} not found`);
    }
    const project = await this.prisma.project.update({
      where: { id },
      data,
      include: projectWithResponsibleInclude,
    });
    if (responsible && responsible !== exists.responsibleId) {
      await this.notificationsService.notifyProjectAssigned({
        userId: responsible,
        projectId: project.id,
        projectName: project.name,
      });
    }
    await this.syncProjectUpdateWithOdoo(project);
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

  private getUserProjectWhere(
    currentUser: AuthenticatedUser,
  ): Prisma.ProjectWhereInput | undefined {
    if (currentUser.role === UserRole.ADMIN) {
      return undefined;
    }

    return { responsibleId: currentUser.id };
  }

  private async ensureCanAccessProject(
    projectId: number,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        ...this.getUserProjectWhere(currentUser),
      },
      select: { id: true },
    });

    if (!project) {
      throw new ForbiddenException('You can only access assigned projects');
    }
  }

  private async syncProjectWithOdoo(
    project: ProjectWithResponsible,
  ): Promise<number | null> {
    try {
      const odooProjectId = await this.odooService.createProject({
        name: project.name,
        description: project.description,
        dateStart: project.createdAt,
        dateLimit: project.dateLimit,
        responsibleEmail: project.responsible.email,
      });

      if (odooProjectId) {
        this.logger.log(`Project synced with Odoo #${odooProjectId}`);
      }

      return odooProjectId;
    } catch (error) {
      this.logger.warn(
        `Project created locally but Odoo sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private async syncProjectUpdateWithOdoo(
    project: ProjectWithResponsible,
  ): Promise<void> {
    try {
      if (!project.odooProjectId) {
        const odooProjectId = await this.syncProjectWithOdoo(project);

        if (odooProjectId) {
          await this.prisma.project.update({
            where: { id: project.id },
            data: { odooProjectId },
          });
        }

        return;
      }

      const updated = await this.odooService.updateProject({
        odooProjectId: project.odooProjectId,
        name: project.name,
        description: project.description,
        dateStart: project.createdAt,
        dateLimit: project.dateLimit,
        responsibleEmail: project.responsible.email,
      });

      if (updated) {
        this.logger.log(
          `Project #${project.id} updated in Odoo #${project.odooProjectId}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Project #${project.id} updated locally but Odoo update failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
