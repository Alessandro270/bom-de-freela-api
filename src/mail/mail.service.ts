import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'smtp.example.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const mailUser = this.configService.get<string>(
      'MAIL_USER',
      'noreply@bomdefreela.pt',
    );
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Bom de Freela" <${mailUser}>`,
      to,
      subject: 'Recuperação de Senha — Bom de Freela',
      html: `
        <h2>Recuperação de Senha</h2>
        <p>Recebemos um pedido de recuperação de senha para a sua conta.</p>
        <p>Clique no link abaixo para definir uma nova senha:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este link é válido por 1 hora.</p>
        <p>Se não solicitou esta alteração, ignore este email.</p>
        <br>
        <p>— Equipa Bom de Freela</p>
      `,
    });
  }
}
