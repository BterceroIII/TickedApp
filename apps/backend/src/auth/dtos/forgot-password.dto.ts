import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  email: string;
}
