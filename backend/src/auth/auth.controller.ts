import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { LoginInput, RegisterInput } from './auth.types.js';
import { AuthService } from './auth.service.js';

const SESSION_COOKIE_NAME = 'asvk_session';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const getCookie = (request: Request, name: string) => {
  const cookies = request.headers.cookie?.split(';') ?? [];

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const cookieName = cookie.slice(0, separatorIndex).trim();

    if (cookieName === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    }
  }

  return null;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.register(body);
    const session = await this.authService.createSession(
      user.id,
      body.rememberMe === true,
    );

    response.cookie(SESSION_COOKIE_NAME, session.token, {
      ...cookieOptions,
      expires: session.persistent ? session.expiresAt : undefined,
    });

    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
      ...cookieOptions,
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
    const token = getCookie(request, SESSION_COOKIE_NAME);

    if (token) {
      await this.authService.deleteSession(token);
    }

    response.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
  }

  @Get('me')
  me(@Req() request: Request) {
    const token = getCookie(request, SESSION_COOKIE_NAME);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.authService.findUserBySession(token);
  }
}
