import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import type { SupportAttachmentInput } from './support.types.js';

interface SupportEmailInput {
  requestId: number;
  topic: string;
  category: string;
  description: string;
  replyEmail: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  attachment?: SupportAttachmentInput;
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  );

@Injectable()
export class SupportMailerService {
  private readonly smtpUser: string | undefined;
  private readonly smtpPassword: string | undefined;
  private readonly supportEmail: string | undefined;
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    this.smtpUser = this.configService.get<string>('SMTP_USER');
    this.smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL_TO');

    if (!this.smtpUser || !this.smtpPassword || !this.supportEmail) {
      this.transporter = null;
      return;
    }

    const port = Number(this.configService.get('SMTP_PORT') ?? 465);
    const secure =
      (this.configService.get<string>('SMTP_SECURE') ?? 'true') === 'true';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') ?? 'smtp.gmail.com',
      port,
      secure,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPassword,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }

  async sendSupportRequest(input: SupportEmailInput) {
    if (!this.transporter || !this.smtpUser || !this.supportEmail) {
      throw new ServiceUnavailableException('Support email is not configured');
    }

    const attachment = input.attachment
      ? [
          {
            filename: input.attachment.originalName,
            content: input.attachment.buffer,
            contentType: input.attachment.mimeType,
          },
        ]
      : undefined;

    try {
      await this.transporter.sendMail({
        from: `"ASVK Schedule" <${this.smtpUser}>`,
        to: this.supportEmail,
        replyTo: input.replyEmail,
        subject: `[ASVK Schedule #${input.requestId}] ${input.topic}`,
        text: [
          `Новое обращение №${input.requestId}`,
          `Пользователь: ${input.user.name} (#${input.user.id})`,
          `Почта аккаунта: ${input.user.email}`,
          `Почта для ответа: ${input.replyEmail}`,
          `Тема: ${input.topic}`,
          `Категория: ${input.category}`,
          '',
          input.description,
        ].join('\n'),
        html: `
          <h2>Новое обращение №${input.requestId}</h2>
          <p><strong>Пользователь:</strong> ${escapeHtml(input.user.name)} (#${input.user.id})</p>
          <p><strong>Почта аккаунта:</strong> ${escapeHtml(input.user.email)}</p>
          <p><strong>Почта для ответа:</strong> ${escapeHtml(input.replyEmail)}</p>
          <p><strong>Тема:</strong> ${escapeHtml(input.topic)}</p>
          <p><strong>Категория:</strong> ${escapeHtml(input.category)}</p>
          <p><strong>Описание:</strong></p>
          <p style="white-space: pre-wrap">${escapeHtml(input.description)}</p>
        `,
        attachments: attachment,
      });
    } catch {
      throw new ServiceUnavailableException('Support email could not be sent');
    }
  }
}
