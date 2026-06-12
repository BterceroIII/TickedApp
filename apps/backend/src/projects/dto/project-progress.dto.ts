import { ApiProperty } from '@nestjs/swagger';
import type { ProjectProgress } from 'src/common/interfaces/project-progress.interface';

export class ProjectProgressDto implements ProjectProgress {
  @ApiProperty({ description: 'Project ID' })
  projectId: number;

  @ApiProperty({ description: 'Total tickets associated with the project' })
  totalTickets: number;

  @ApiProperty({ description: 'Resolved tickets associated with the project' })
  resolvedTickets: number;

  @ApiProperty({ description: 'Resolved tickets percentage from 0 to 100' })
  percentage: number;
}
