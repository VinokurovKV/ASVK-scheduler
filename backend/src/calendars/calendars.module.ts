import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma.module.js';
import { CalendarsController } from './calendars.controller.js';
import { CalendarsService } from './calendars.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CalendarsController],
  providers: [CalendarsService],
  exports: [CalendarsService],
})
export class CalendarsModule {}
