import { IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(300)
  message: string;

  @IsString()
  @IsOptional()
  ticketId?: string;

  @IsInt()
  @IsOptional()
  projectId?: number;
}
