import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventsService } from './events.service.js';
import type { CreateEventInput } from './events.types.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Post()
  create(@Body() body: CreateEventInput) {
    return this.eventsService.create(body);
  }
}
