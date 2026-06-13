import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmAccountDto {
  @ApiProperty({ description: 'Confirmation token', example: 'ABC123' })
  @IsString()
  token: string;
}
