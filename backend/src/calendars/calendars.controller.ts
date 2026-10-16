import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { CalendarsService } from './calendars.service.js';

@Controller('calendars')
@UseGuards(SessionAuthGuard)
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.calendarsService.findAll(request.user.id);
  }
}
