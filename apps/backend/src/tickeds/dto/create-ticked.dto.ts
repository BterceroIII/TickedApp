import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketPriority, TicketStatus } from 'src/generated/prisma/client';

export class CreateTickedDto {
  @ApiProperty({ description: 'The project ID' })
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty({ description: 'The title of the ticket' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'The description of the ticket' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The status of the ticket' })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;

  @ApiProperty({ description: 'The priority of the ticket' })
  @IsEnum(TicketPriority)
  @IsNotEmpty()
  priority: TicketPriority;
}
