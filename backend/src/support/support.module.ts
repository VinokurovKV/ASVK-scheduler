import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma.module.js';
import { SupportController } from './support.controller.js';
import { SupportMailerService } from './support-mailer.service.js';
import { SupportService } from './support.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SupportController],
  providers: [SupportService, SupportMailerService],
})
export class SupportModule {}
