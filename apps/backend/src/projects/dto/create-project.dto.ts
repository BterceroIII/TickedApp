import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProjectStatus } from 'src/generated/prisma/client';

export class CreateProjectDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the project' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'The responsible of the project' })
  @IsString()
  @IsNotEmpty()
  responsible: string;

  @ApiProperty({ description: 'The date limit of the project' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dateLimit: Date;

  @ApiProperty({ description: 'The status of the project' })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;
}
