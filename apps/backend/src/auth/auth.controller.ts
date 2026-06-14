import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import {
  authCookieName,
  authCookieNames,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} from './auth-cookie';
import { CreateAccountDto } from './dtos/create-account.dto';
import { ConfirmAccountDto } from './dtos/confirm-account.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { User } from 'src/generated/prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.createAccount(createAccountDto);
    return { message };
  }

  @Post('confirm-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm user account with token' })
  @ApiResponse({ status: 200, description: 'Account confirmed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async confirmAccount(
    @Body() confirmAccountDto: ConfirmAccountDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.confirmAccount(confirmAccountDto);
    return { message };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Account not confirmed' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string; token: string }> {
    const token = await this.authService.login(loginDto);
    response.cookie(authCookieName, token, getAuthCookieOptions());
    return { message: 'Sesión iniciada correctamente', token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear current auth session' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) response: Response): { message: string } {
    for (const cookieName of new Set(authCookieNames)) {
      response.clearCookie(cookieName, getClearAuthCookieOptions());
    }

    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.forgotPassword(forgotPasswordDto);
    return { message };
  }

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate password reset token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  async validateToken(
    @Body() confirmAccountDto: ConfirmAccountDto,
  ): Promise<{ message: string }> {
    const message = await this.authService.validateToken(confirmAccountDto);
    return { message };
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Current user information', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.authService.getUser(user.id);
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users available as project responsibles' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAllUsers() {
    return this.authService.findAllUsers();
  }
}
