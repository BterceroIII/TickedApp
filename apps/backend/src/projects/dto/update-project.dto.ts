import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from 'src/generated/prisma/client';

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: 'The name of the project' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'The responsible of the project' })
  @IsString()
  @IsOptional()
  responsible?: string;

  @ApiPropertyOptional({ description: 'The date limit of the project' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateLimit?: Date;

  @ApiPropertyOptional({ description: 'The status of the project' })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
