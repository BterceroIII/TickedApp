import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'User name', example: 'John Doe', maxLength: 50 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
    maxLength: 50,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'myPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
