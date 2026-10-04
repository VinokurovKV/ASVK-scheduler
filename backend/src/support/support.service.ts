import {
  BadRequestException,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type {
  CreateSupportRequestInput,
  SupportAttachmentInput,
} from './support.types.js';
import { SupportMailerService } from './support-mailer.service.js';

const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const allowedTopics = new Set([
  'Проблема с расписанием',
  'Проблема с событием',
  'Проблема со входом',
  'Предложение',
  'Другое',
]);

const allowedCategories = new Set([
  'Некорректные данные',
  'Ошибка интерфейса',
  'Не работает функция',
  'Вопрос по приложению',
  'Другое',
]);

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const allowedExtensions = new Set(['.pdf', '.txt', '.doc', '.docx']);

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const isSupportedAttachment = (attachment: SupportAttachmentInput) => {
  if (attachment.mimeType.startsWith('image/')) {
    return true;
  }

  if (allowedMimeTypes.has(attachment.mimeType)) {
    return true;
  }

  const normalizedName = attachment.originalName.toLowerCase();

  return [...allowedExtensions].some((extension) =>
    normalizedName.endsWith(extension),
  );
};

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supportMailer: SupportMailerService,
  ) {}

  async create(
    userId: number,
    input: CreateSupportRequestInput,
    attachment?: SupportAttachmentInput,
  ) {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('Support request data is required');
    }

    const topic = normalizeString(input.topic);
    const category = normalizeString(input.category);
    const description = normalizeString(input.description);
    const replyEmail = normalizeString(input.replyEmail).toLowerCase();

    if (!allowedTopics.has(topic)) {
      throw new BadRequestException('Support request topic is invalid');
    }

    if (!allowedCategories.has(category)) {
      throw new BadRequestException('Support request category is invalid');
    }

    if (!description || description.length > MAX_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        'Support request description has an invalid length',
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail) ||
      replyEmail.length > 254
    ) {
      throw new BadRequestException('Reply email has an invalid format');
    }

    if (attachment) {
      if (attachment.size > MAX_ATTACHMENT_SIZE) {
        throw new BadRequestException(
          'Support request attachment is too large',
        );
      }

      if (!attachment.originalName || attachment.originalName.length > 255) {
        throw new BadRequestException(
          'Support request attachment name is invalid',
        );
      }

      if (!isSupportedAttachment(attachment)) {
        throw new UnsupportedMediaTypeException(
          'Support request attachment type is not supported',
        );
      }
    }

    const attachmentData = attachment
      ? Uint8Array.from(attachment.buffer)
      : undefined;

    const request = await this.prisma.supportRequest.create({
      data: {
        topic,
        category,
        description,
        replyEmail,
        userId,
        attachmentName: attachment?.originalName,
        attachmentMimeType: attachment?.mimeType,
        attachmentSize: attachment?.size,
        attachmentData,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    try {
      await this.supportMailer.sendSupportRequest({
        requestId: request.id,
        topic,
        category,
        description,
        replyEmail,
        user: request.user,
        attachment,
      });
    } catch (error) {
      await this.prisma.supportRequest.delete({
        where: {
          id: request.id,
        },
      });

      throw error;
    }

    return {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
    };
  }
}
