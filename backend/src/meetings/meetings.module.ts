import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CalendarsModule } from '../calendars/calendars.module.js';
import { PrismaModule } from '../prisma.module.js';
import { MeetingsController } from './meetings.controller.js';
import { MeetingsService } from './meetings.service.js';

@Module({
  imports: [PrismaModule, AuthModule, CalendarsModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
