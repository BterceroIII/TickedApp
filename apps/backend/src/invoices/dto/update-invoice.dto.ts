import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { InvoiceStatus } from 'src/generated/prisma/client';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ description: 'Invoice concept or description' })
  @IsString()
  @IsOptional()
  concept?: string;

  @ApiPropertyOptional({ description: 'Invoice amount' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Invoice status' })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Invoice due date' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Date when the invoice was paid' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  paidAt?: Date;
}
