import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TicketPriority, TicketStatus } from 'src/generated/prisma/client';

export class UpdateTickedDto {
  @ApiPropertyOptional({ description: 'The project ID' })
  @IsInt()
  @IsOptional()
  projectId?: number;

  @ApiPropertyOptional({ description: 'The title of the ticket' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'The description of the ticket' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'The status of the ticket' })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({ description: 'The priority of the ticket' })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({
    description: 'The estimated resolution date of the ticket',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  estimatedDate?: Date;
}
