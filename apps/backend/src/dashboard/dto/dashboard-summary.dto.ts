import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricDto {
  @ApiProperty({ description: 'Metric label shown in the dashboard' })
  label: string;

  @ApiProperty({ description: 'Current metric value' })
  value: number;

  @ApiProperty({ description: 'Short supporting context for the metric' })
  helper: string;
}

export class DashboardProjectDto {
  @ApiProperty({ description: 'Project ID' })
  id: number;

  @ApiProperty({ description: 'Project name' })
  name: string;

  @ApiProperty({ description: 'Current project status' })
  status: string;

  @ApiProperty({ description: 'Project due date' })
  dateLimit: Date;

  @ApiProperty({ description: 'Total tickets associated with the project' })
  totalTickets: number;

  @ApiProperty({ description: 'Resolved tickets associated with the project' })
  resolvedTickets: number;

  @ApiProperty({ description: 'Resolved ticket percentage from 0 to 100' })
  progress: number;
}

export class DashboardTicketDto {
  @ApiProperty({ description: 'Ticket ID' })
  id: string;

  @ApiProperty({ description: 'Ticket title' })
  title: string;

  @ApiProperty({ description: 'Current ticket status' })
  status: string;

  @ApiProperty({ description: 'Ticket priority' })
  priority: string;

  @ApiProperty({ description: 'Related project name' })
  projectName: string;

  @ApiProperty({ description: 'Ticket creation date' })
  createdAt: Date;
}

export class DashboardInvoiceDto {
  @ApiProperty({ description: 'Invoice ID' })
  id: string;

  @ApiProperty({ description: 'Invoice concept' })
  concept: string;

  @ApiProperty({ description: 'Invoice amount' })
  amount: number;

  @ApiProperty({ description: 'Current invoice status' })
  status: string;

  @ApiProperty({ description: 'Invoice due date' })
  dueDate: Date;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: [DashboardMetricDto] })
  metrics: DashboardMetricDto[];

  @ApiProperty({ type: [DashboardProjectDto] })
  activeProjects: DashboardProjectDto[];

  @ApiProperty({ type: [DashboardTicketDto] })
  recentTickets: DashboardTicketDto[];

  @ApiProperty({ type: [DashboardInvoiceDto] })
  recentInvoices: DashboardInvoiceDto[];
}
