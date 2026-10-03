import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthenticatedRequest } from './authenticated-request.js';
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from './auth.types.js';
import { AuthService } from './auth.service.js';
import { SessionAuthGuard } from './session-auth.guard.js';
import {
  getSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from './session-cookie.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() body: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, session } = await this.authService.register(body);

    response.cookie(SESSION_COOKIE_NAME, session.token, {
      ...sessionCookieOptions,
      expires: session.persistent ? session.expiresAt : undefined,
    });

    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body() body: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(body);
    const session = await this.authService.createSession(
      user.id,
      body.rememberMe === true,
    );

    response.cookie(SESSION_COOKIE_NAME, session.token, {
      ...sessionCookieOptions,
      expires: session.persistent ? session.expiresAt : undefined,
    });

    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = getSessionToken(request);

    if (token) {
      await this.authService.deleteSession(token);
    }

    response.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Patch('me')
  @UseGuards(SessionAuthGuard)
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateProfileInput,
  ) {
    return this.authService.updateProfile(request.user.id, body);
  }
}
