import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Project, Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        responsible: { connect: { id: dto.responsible } },
      },
    });
    this.logger.log(`Project created successfully`);
    return project;
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany();
    this.logger.log(`Retrieved all projects`);
    return projects;
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
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
  ): Promise<Project> {
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
