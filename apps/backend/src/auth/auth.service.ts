import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AUTH_MESSAGES } from 'src/common/constants/messages.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto } from './dtos/create-account.dto';
import { checkPassword, generateJWT, generateToken, hashPassword } from 'src/common/utils';
import { ConfirmAccountDto } from './dtos/confirm-account.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { User } from 'src/generated/prisma/client';
import { EmailsService } from 'src/emails/emails.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailsService
  ) {}

  async createAccount(createAccountDto: CreateAccountDto): Promise<string> {
    const { email, password, name } = createAccountDto;

    try {
      // Prevent duplicates
      const userExists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        this.logger.error(`Registration attempt with existing email: ${email}`);
        throw new ConflictException(AUTH_MESSAGES.EMAIL_EXISTS);
      }

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
          token: generateToken(),
          confirmed: false,
        }
      });

      this.logger.log(`New user registered: ${email}`);

      await this.emailService.sendConfirmationEmail({
        name: user.name!,
        email: user.email,
        token: user.token!,
      });
      this.logger.log(`Confirmation email sent to: ${email}`);

      return AUTH_MESSAGES.ACCOUNT_CREATED;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Error creating account: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(AUTH_MESSAGES.GENERIC_ERROR);
    }
  }

  async confirmAccount(confirmAccountDto: ConfirmAccountDto): Promise<string> {
    const { token } = confirmAccountDto;

    try {
      const user = await this.prisma.user.findUnique({ where: { token } });

      if (!user) {
        this.logger.error(
          `Account confirmation attempt with invalid token: ${token}`,
        );
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { confirmed: true, token: null },
      });
  
      this.logger.log(`Account confirmed for user: ${user.email}`);

      return AUTH_MESSAGES.ACCOUNT_CONFIRMED;
    } catch (error) {
      this.logger.error(
        `Error confirming account: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        this.logger.error(`Login attempt with non-existent email: ${email}`);
        throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.confirmed) {
        this.logger.error(`Login attempt with unconfirmed account: ${email}`);
        throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_NOT_CONFIRMED);
      }

      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        this.logger.error(`Failed login attempt for user: ${email}`);
        throw new UnauthorizedException(AUTH_MESSAGES.INCORRECT_PASSWORD);
      }

      const token = generateJWT(user.id);
      this.logger.log(`Successful login for user: ${email}`);
      return token;
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const { email } = forgotPasswordDto;

    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        this.logger.error(
          `Password reset attempt for non-existent email: ${email}`,
        );
        throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const userToken = user.token = generateToken();
      await this.prisma.user.update({
        where: { id: user.id},
        data: {
          token: userToken
        }
      });
      this.logger.log(`Password reset token generated for user: ${email}`);

      await this.emailService.sendPasswordResetToken({
        name: user.name!,
        email: user.email,
        token: userToken,
      });
      this.logger.log(`Password reset email sent to: ${email}`);

      return AUTH_MESSAGES.CHECK_EMAIL;
    } catch (error) {
      this.logger.error(
        `Error in forgot password process: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async validateToken(confirmAccountDto: ConfirmAccountDto): Promise<string> {
    const { token } = confirmAccountDto;

    try {
      const tokenExists = await this.prisma.user.findUnique({
        where: { token },
      });

      if (!tokenExists) {
        this.logger.error(
          `Token validation attempt with invalid token: ${token}`,
        );
        throw new NotFoundException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      this.logger.log(`Token validated successfully`);
      return AUTH_MESSAGES.TOKEN_VALID;
    } catch (error) {
      this.logger.error(
        `Error validating token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }


  async resetPasswordWithToken(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    const { password } = resetPasswordDto;

    try {
      const user = await this.prisma.user.findUnique({ where: { token } });
      if (!user) {
        this.logger.error(
          `Password reset attempt with invalid token: ${token}`,
        );
        throw new NotFoundException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      const newpassword = user.password = await hashPassword(password);
      user.token = null;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: newpassword, token: null },
      });
      this.logger.log(`Password reset successful for user: ${user.email}`);

      return AUTH_MESSAGES.PASSWORD_CHANGED;
    } catch (error) {
      this.logger.error(
        `Error resetting password: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getUser(userId: string){
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {id: true, name: true, email: true}
      });

      if (!user) {
        this.logger.warn(`User fetch attempt with invalid ID: ${userId}`);
        throw new NotFoundException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error fetching user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { email: 'asc' },
    });

    this.logger.log('Retrieved all users');
    return users;
  }
}
