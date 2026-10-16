import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { OwnerGuard } from './owner.guard.js';
import { SystemService } from './system.service.js';
import type { UpdateUserAppRolesInput } from './system.types.js';

@Controller('system')
@UseGuards(SessionAuthGuard, OwnerGuard)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('users')
  findUsers() {
    return this.systemService.findUsers();
  }

  @Patch('users/:id/app-roles')
  updateUserAppRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserAppRolesInput,
  ) {
    return this.systemService.updateUserAppRoles(id, body);
  }
}
