import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectProgressDto } from './dto/project-progress.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectWithResponsible } from './types/project-responsible.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRole, type User } from 'src/generated/prisma/client';

@ApiTags('Projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectWithResponsible> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  findAll(@CurrentUser() user: User): Promise<ProjectWithResponsible[]> {
    return this.projectsService.findAll(user);
  }

  @Get('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get progress metrics for all projects' })
  @ApiResponse({ status: 200, description: 'Project progress metrics' })
  findProgress(@CurrentUser() user: User): Promise<ProjectProgressDto[]> {
    return this.projectsService.findProgress(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ProjectWithResponsible> {
    return this.projectsService.findOne(+id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectWithResponsible> {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.projectsService
      .remove(+id)
      .then(() => ({ message: 'Project deleted successfully' }));
  }
}
