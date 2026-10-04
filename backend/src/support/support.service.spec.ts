import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma.service.js';
import type { SupportMailerService } from './support-mailer.service.js';
import { SupportService } from './support.service.js';

const validInput = {
  topic: 'Проблема с расписанием',
  category: 'Ошибка интерфейса',
  description: 'На экране не отображается событие.',
  replyEmail: 'user@example.com',
};

const createService = () => {
  const create = vi.fn().mockResolvedValue({
    id: 1,
    status: 'OPEN',
    createdAt: new Date(),
    user: {
      id: 42,
      name: 'Test User',
      email: 'user@example.com',
    },
  });
  const remove = vi.fn().mockResolvedValue({ id: 1 });
  const sendSupportRequest = vi.fn().mockResolvedValue(undefined);
  const prisma = {
    supportRequest: {
      create,
      delete: remove,
    },
  };
  const supportMailer = {
    sendSupportRequest,
  };

  return {
    create,
    remove,
    sendSupportRequest,
    service: new SupportService(
      prisma as unknown as PrismaService,
      supportMailer as unknown as SupportMailerService,
    ),
  };
};

describe('SupportService', () => {
  it('creates a support request for the authenticated user', async () => {
    const { create, service } = createService();

    await service.create(42, validInput);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 42,
          topic: validInput.topic,
          replyEmail: validInput.replyEmail,
        }),
      }),
    );
  });

  it('rejects an empty description', async () => {
    const { service } = createService();

    await expect(
      service.create(42, { ...validInput, description: ' ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores a supported attachment', async () => {
    const { create, service } = createService();

    await service.create(42, validInput, {
      originalName: 'screen.png',
      mimeType: 'image/png',
      size: 4,
      buffer: Buffer.from('test'),
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attachmentName: 'screen.png',
          attachmentSize: 4,
          attachmentData: expect.any(Uint8Array),
        }),
      }),
    );
  });

  it('rejects an unsupported attachment', async () => {
    const { service } = createService();

    await expect(
      service.create(42, validInput, {
        originalName: 'archive.zip',
        mimeType: 'application/zip',
        size: 4,
        buffer: Buffer.from('test'),
      }),
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
  });

  it('rolls back the request when email delivery fails', async () => {
    const { remove, sendSupportRequest, service } = createService();
    sendSupportRequest.mockRejectedValueOnce(new Error('SMTP unavailable'));

    await expect(service.create(42, validInput)).rejects.toThrow(
      'SMTP unavailable',
    );
    expect(remove).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
