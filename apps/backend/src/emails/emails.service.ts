import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailUser } from './interfaces/email-user.interface';

@Injectable()
export class EmailsService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(
      this.configService.get<string>('RESEND_API_KEY')
    );
  }

  async sendConfirmationEmail(user: EmailUser): Promise<void> {
    await this.resend.emails.send({
      from: 'TickedApp <onboarding@btercero.dev>',
      to: user.email,
      subject: 'TickedApp - Confirma tu cuenta',
      html: `
        <p>Hola ${user.name}, has creado tu cuenta en TickedApp.</p>

        <p>Visita el siguiente enlace:</p>

        <a href="${this.configService.get('FRONTEND_URL')}/auth/confirm-account">
          Confirmar cuenta
        </a>

        <p>e ingresa el código: <b>${user.token}</b></p>
      `,
    });
  }

  async sendPasswordResetToken(user: EmailUser): Promise<void> {
    await this.resend.emails.send({
      from: 'TickedApp <onboarding@btercero.dev>',
      to: user.email,
      subject: 'TickedApp - Reestablece tu Password',
      html: `
        <p>Hola ${user.name}, solicitaste reestablecer tu contraseña.</p>

        <a href="${this.configService.get('FRONTEND_URL')}/auth/new-password">
          Reestablecer Password
        </a>

        <p>Código: <b>${user.token}</b></p>
      `,
    });
  }
}