import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'New password', example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  password: string;
}
