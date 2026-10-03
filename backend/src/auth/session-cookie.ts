import type { Request } from 'express';

export const SESSION_COOKIE_NAME = 'asvk_session';

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const getSessionToken = (request: Request) => {
  const cookies = request.headers.cookie?.split(';') ?? [];

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const cookieName = cookie.slice(0, separatorIndex).trim();

    if (cookieName !== SESSION_COOKIE_NAME) {
      continue;
    }

    try {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
};
