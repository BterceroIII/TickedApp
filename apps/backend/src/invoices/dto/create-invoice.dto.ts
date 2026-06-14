import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { InvoiceStatus } from 'src/generated/prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Invoice concept or description' })
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty({ description: 'Invoice amount' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Invoice status' })
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;

  @ApiProperty({ description: 'Invoice due date' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dueDate: Date;

  @ApiPropertyOptional({ description: 'Date when the invoice was paid' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  paidAt?: Date;
}
