import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { EventsService } from './events.service.js';
import type { CreateEventInput, UpdateEventInput } from './events.types.js';

@Controller('events')
@UseGuards(SessionAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.eventsService.findAll(request.user.id);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: CreateEventInput) {
    return this.eventsService.create(request.user.id, body);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEventInput,
  ) {
    return this.eventsService.update(request.user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.eventsService.remove(request.user.id, id);
  }
}
