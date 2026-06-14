import { Injectable, Logger } from '@nestjs/common';
import {
  Prisma,
  InvoiceStatus,
  ProjectStatus,
  TicketStatus,
  UserRole,
} from 'src/generated/prisma/client';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    currentUser: AuthenticatedUser,
  ): Promise<DashboardSummaryDto> {
    const projectWhere = this.getProjectWhere(currentUser);
    const ticketWhere = this.getTicketWhere(currentUser);
    const invoiceWhere: Prisma.InvoiceWhereInput = { userId: currentUser.id };
    const activeProjectWhere: Prisma.ProjectWhereInput = {
      ...projectWhere,
      status: { not: ProjectStatus.COMPLETADO },
    };
    const openTicketWhere: Prisma.TicketWhereInput = {
      ...ticketWhere,
      status: TicketStatus.ABIERTO,
    };

    const [
      activeProjectsCount,
      openTicketsCount,
      completedProjectsCount,
      pendingInvoicesCount,
      inProgressTicketsCount,
      activeProjects,
      recentTickets,
      recentInvoices,
    ] = await this.prisma.$transaction([
      this.prisma.project.count({ where: activeProjectWhere }),
      this.prisma.ticket.count({ where: openTicketWhere }),
      this.prisma.project.count({
        where: { ...projectWhere, status: ProjectStatus.COMPLETADO },
      }),
      this.prisma.invoice.count({
        where: { ...invoiceWhere, status: InvoiceStatus.PENDIENTE },
      }),
      this.prisma.ticket.count({
        where: { ...ticketWhere, status: TicketStatus.EN_PROCESO },
      }),
      this.prisma.project.findMany({
        where: activeProjectWhere,
        select: {
          id: true,
          name: true,
          status: true,
          dateLimit: true,
          tickets: { select: { status: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.ticket.findMany({
        where: ticketWhere,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          project: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.invoice.findMany({
        where: invoiceWhere,
        select: {
          id: true,
          concept: true,
          amount: true,
          status: true,
          dueDate: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    this.logger.log('Retrieved dashboard summary');

    return {
      metrics: [
        {
          label: 'Proyectos activos',
          value: activeProjectsCount,
          helper: 'Sin contar proyectos completados',
        },
        {
          label: 'Tickets abiertos',
          value: openTicketsCount,
          helper: `${inProgressTicketsCount} en proceso`,
        },
        {
          label: 'Facturas pendientes',
          value: pendingInvoicesCount,
          helper: `${completedProjectsCount} proyectos completados`,
        },
      ],
      activeProjects: activeProjects.map((project) => {
        const totalTickets = project.tickets.length;
        const resolvedTickets = project.tickets.filter(
          (ticket) => ticket.status === TicketStatus.RESUELTO,
        ).length;

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          dateLimit: project.dateLimit,
          totalTickets,
          resolvedTickets,
          progress:
            totalTickets > 0
              ? Math.round((resolvedTickets / totalTickets) * 100)
              : 0,
        };
      }),
      recentTickets: recentTickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        projectName: ticket.project.name,
        createdAt: ticket.createdAt,
      })),
      recentInvoices: recentInvoices.map((invoice) => ({
        id: invoice.id,
        concept: invoice.concept,
        amount: Number(invoice.amount),
        status: invoice.status,
        dueDate: invoice.dueDate,
      })),
    };
  }

  private getProjectWhere(
    currentUser: AuthenticatedUser,
  ): Prisma.ProjectWhereInput | undefined {
    if (currentUser.role === UserRole.ADMIN) {
      return undefined;
    }

    return { responsibleId: currentUser.id };
  }

  private getTicketWhere(
    currentUser: AuthenticatedUser,
  ): Prisma.TicketWhereInput | undefined {
    if (currentUser.role === UserRole.ADMIN) {
      return undefined;
    }

    return { assignedToId: currentUser.id };
  }
}
