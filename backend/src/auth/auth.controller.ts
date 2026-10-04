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
  ChangePasswordInput,
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
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, session } = await this.authService.register(
      body,
      request.get('user-agent'),
    );

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
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(body);
    const session = await this.authService.createSession(
      user.id,
      body.rememberMe === true,
      request.get('user-agent'),
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

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionAuthGuard)
  async logoutAll(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.deleteAllSessions(request.user.id);

    response.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Get('sessions')
  @UseGuards(SessionAuthGuard)
  sessions(@Req() request: AuthenticatedRequest) {
    return this.authService.getSessions(
      request.user.id,
      request.sessionToken,
    );
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionAuthGuard, ThrottlerGuard)
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: ChangePasswordInput,
  ) {
    return this.authService.changePassword(request.user.id, body);
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
