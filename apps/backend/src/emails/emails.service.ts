import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailUser } from './interfaces/email-user.interface';


@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendConfirmationEmail(user: EmailUser): Promise<void> {
    await this.transporter.sendMail({
      from: 'TickedApp <admin@cashtrackr.com>',
      to: user.email,
      subject: 'TickedApp - Confirma tu cuenta',
      html: `
                <p>Hola: ${user.name}, has creado tu cuenta en TickedApp, ya esta casi lista</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${this.configService.get('FRONTEND_URL')}/auth/confirm-account">Confirmar cuenta</a>
                <p>e ingresa el código: <b>${user.token}</b></p>
            `,
    });
  }

  async sendPasswordResetToken(user: EmailUser): Promise<void> {
    await this.transporter.sendMail({
      from: 'TickedApp <admin@cashtrackr.com>',
      to: user.email,
      subject: 'TickedApp - Reestablece tu Password',
      html: `
                <p>Hola: ${user.name}, has solicitado reestablecer tu password</p>
                <p>Visita el siguiente enlace:</p>
                <a href="${this.configService.get('FRONTEND_URL')}/auth/new-password">Reestablecer Password</a>
                <p>e ingresa el código: <b>${user.token}</b></p>
            `,
    });
  }
}
