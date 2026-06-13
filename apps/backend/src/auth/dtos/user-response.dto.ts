import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', example: 'USER' })
  role: string;
}
