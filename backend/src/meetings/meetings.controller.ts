import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { MeetingsService } from './meetings.service.js';

@Controller('meetings')
@UseGuards(SessionAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.meetingsService.findAll(request.user.id);
  }
}
