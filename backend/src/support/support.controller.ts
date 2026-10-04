import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { SupportService } from './support.service.js';
import type { CreateSupportRequestInput } from './support.types.js';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

interface UploadedSupportFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('support-requests')
@UseGuards(SessionAuthGuard, ThrottlerGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('attachment', {
      limits: {
        files: 1,
        fileSize: MAX_ATTACHMENT_SIZE,
      },
    }),
  )
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateSupportRequestInput,
    @UploadedFile() file?: UploadedSupportFile,
  ) {
    return this.supportService.create(
      request.user.id,
      body,
      file
        ? {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            buffer: file.buffer,
          }
        : undefined,
    );
  }
}
