import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { getSessionToken } from './session-cookie.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = getSessionToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const user = await this.authService.findUserBySession(token);

    (request as AuthenticatedRequest).user = user;

    return true;
  }
}
