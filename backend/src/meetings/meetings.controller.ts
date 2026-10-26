import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { MeetingsService } from './meetings.service.js';
import type { CreateMeetingInput } from './meetings.types.js';

@Controller('meetings')
@UseGuards(SessionAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.meetingsService.findAll(request.user.id);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateMeetingInput,
  ) {
    return this.meetingsService.create(request.user.id, body);
  }
}
