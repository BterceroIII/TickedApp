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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectProgressDto } from './dto/project-progress.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectWithResponsible } from './types/project-responsible.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Projects')
@Controller('budget')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
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
  findAll(): Promise<ProjectWithResponsible[]> {
    return this.projectsService.findAll();
  }

  @Get('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get progress metrics for all projects' })
  @ApiResponse({ status: 200, description: 'Project progress metrics' })
  findProgress(): Promise<ProjectProgressDto[]> {
    return this.projectsService.findProgress();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project found' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string): Promise<ProjectWithResponsible> {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
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
