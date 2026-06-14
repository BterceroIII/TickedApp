import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, type Invoice } from 'src/generated/prisma/client';
import { AuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';
import { generateInvoiceId } from 'src/common/utils/invoice-id';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateInvoiceDto,
    currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    const id = await generateInvoiceId(this.prisma);
    const invoice = await this.prisma.invoice.create({
      data: {
        id,
        concept: dto.concept,
        amount: new Prisma.Decimal(dto.amount),
        status: dto.status,
        dueDate: dto.dueDate,
        paidAt: dto.paidAt,
        user: { connect: { id: currentUser.id } },
      },
    });

    this.logger.log(`Invoice #${id} created successfully`);
    return invoice;
  }

  async findAll(currentUser: AuthenticatedUser): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log('Retrieved all invoices');
    return invoices;
  }

  async findOne(id: string, currentUser: AuthenticatedUser): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId: currentUser.id },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice #${id} not found`);
    }

    this.logger.log(`Retrieved invoice #${id}`);
    return invoice;
  }

  async update(
    id: string,
    dto: UpdateInvoiceDto,
    currentUser: AuthenticatedUser,
  ): Promise<Invoice> {
    await this.findOne(id, currentUser);

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.amount !== undefined
          ? { amount: new Prisma.Decimal(dto.amount) }
          : {}),
      },
    });

    this.logger.log(`Invoice #${id} updated successfully`);
    return invoice;
  }

  async remove(id: string, currentUser: AuthenticatedUser): Promise<void> {
    await this.findOne(id, currentUser);

    await this.prisma.invoice.delete({ where: { id } });
    this.logger.log(`Invoice #${id} deleted successfully`);
  }
}
