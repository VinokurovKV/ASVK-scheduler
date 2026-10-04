import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthService } from './auth.service.js';
import { SessionAuthGuard } from './session-auth.guard.js';

const createContext = (cookie?: string) => {
  const request = {
    headers: {
      cookie,
    },
    get: () => undefined,
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  return {
    context,
    request,
  };
};

describe('SessionAuthGuard', () => {
  it('rejects a request without a session cookie', async () => {
    const authService = {
      findUserBySession: vi.fn(),
    };
    const guard = new SessionAuthGuard(authService as unknown as AuthService);
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authService.findUserBySession).not.toHaveBeenCalled();
  });

  it('attaches the authenticated user to the request', async () => {
    const user = {
      id: 42,
    };
    const authService = {
      findUserBySession: vi.fn().mockResolvedValue(user),
    };
    const guard = new SessionAuthGuard(authService as unknown as AuthService);
    const { context, request } = createContext('asvk_session=test-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.findUserBySession).toHaveBeenCalledWith(
      'test-token',
      undefined,
    );
    expect(request).toHaveProperty('user', user);
    expect(request).toHaveProperty('sessionToken', 'test-token');
  });
});
