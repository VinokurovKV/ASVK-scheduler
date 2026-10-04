import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from './auth.types.js';
import {
  hashPassword,
  passwordNeedsRehash,
  verifyPassword,
} from './password.js';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const REMEMBERED_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const publicUserSelect = {
  id: true,
  name: true,

  firstName: true,
  lastName: true,

  username: true,
  email: true,

  role: true,
  groupNumber: true,

  authProvider: true,

  createdAt: true,
  updatedAt: true,
} as const;

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeIdentifier = (value: unknown) =>
  normalizeString(value).toLowerCase();

const validatePassword = (password: string) => {
  if (password.length < 8) {
    throw new BadRequestException(
      'Password must contain at least 8 characters',
    );
  }

  if (password.length > 128) {
    throw new BadRequestException(
      'Password must contain at most 128 characters',
    );
  }
};

const hashSessionToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const dummyPasswordHash = hashPassword(randomBytes(32).toString('base64url'));

const createSessionDetails = (rememberMe: boolean) => {
  const token = randomBytes(32).toString('base64url');
  const duration = rememberMe
    ? REMEMBERED_SESSION_DURATION_MS
    : SESSION_DURATION_MS;
  const expiresAt = new Date(Date.now() + duration);

  return {
    token,
    expiresAt,
    persistent: rememberMe,
    tokenHash: hashSessionToken(token),
  };
};

const getBrowserName = (userAgent: string) => {
  if (/Edg\//i.test(userAgent)) return 'Edge';
  if (/CriOS|Chrome/i.test(userAgent)) return 'Chrome';
  if (/FxiOS|Firefox/i.test(userAgent)) return 'Firefox';
  if (/Safari/i.test(userAgent)) return 'Safari';

  return null;
};

const getDeviceDetails = (userAgent?: string | null) => {
  const normalizedUserAgent = userAgent ?? '';
  const browserName = getBrowserName(normalizedUserAgent);

  const withBrowser = (deviceName: string) => ({
    deviceName: browserName ? `${deviceName} · ${browserName}` : deviceName,
  });

  if (/iPhone/i.test(normalizedUserAgent)) {
    return { deviceType: 'PHONE' as const, ...withBrowser('iPhone') };
  }

  if (/iPad|Macintosh.*Mobile/i.test(normalizedUserAgent)) {
    return { deviceType: 'PHONE' as const, ...withBrowser('iPad') };
  }

  if (/Android/i.test(normalizedUserAgent)) {
    return {
      deviceType: 'PHONE' as const,
      ...withBrowser('Android'),
    };
  }

  if (/Macintosh|Mac OS X/i.test(normalizedUserAgent)) {
    return { deviceType: 'LAPTOP' as const, ...withBrowser('Mac') };
  }

  if (/Windows/i.test(normalizedUserAgent)) {
    return {
      deviceType: 'DESKTOP' as const,
      ...withBrowser('Windows PC'),
    };
  }

  if (/Linux/i.test(normalizedUserAgent)) {
    return {
      deviceType: 'DESKTOP' as const,
      ...withBrowser('Linux PC'),
    };
  }

  return {
    deviceType: 'DESKTOP' as const,
    deviceName: 'Неизвестное устройство',
  };
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterInput, userAgent?: string) {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('Registration data is required');
    }

    const firstName = normalizeString(input.firstName);
    const lastName = normalizeString(input.lastName);

    const name = `${firstName} ${lastName}`;

    const username = normalizeIdentifier(input.username);

    const email = normalizeIdentifier(input.email);

    const password = typeof input.password === 'string' ? input.password : '';

    if (!firstName || firstName.length > 50) {
      throw new BadRequestException('First name has an invalid format');
    }

    if (!lastName || lastName.length > 50) {
      throw new BadRequestException('Last name has an invalid format');
    }

    const allowedRoles = new Set([
      'STUDENT',
      'POSTGRADUATE',
      'EMPLOYEE',
    ]);

    if (!allowedRoles.has(input.role)) {
      throw new BadRequestException('Role has an invalid value');
    }

    const isStudent = input.role === 'STUDENT';

    const allowedGroups = new Set(['321', '421', '521', '621']);

    const groupNumber = isStudent ? normalizeString(input.groupNumber) : null;

    if (isStudent && !allowedGroups.has(groupNumber ?? '')) {
      throw new BadRequestException('Student group has an invalid value');
    }

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new BadRequestException('Username has an invalid format');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new BadRequestException('Email has an invalid format');
    }

    validatePassword(password);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username or email is already in use');
    }

    const passwordHash = await hashPassword(password);
    const session = createSessionDetails(input.rememberMe === true);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,

          firstName,
          lastName,

          username,
          email,

          role: input.role,
          groupNumber,

          authProvider: 'STANDARD',

          credential: {
            create: {
              passwordHash,
            },
          },

          calendars: {
            create: {
              name: 'Мой календарь',
              type: 'PERSONAL',
            },
          },

          sessions: {
            create: {
              tokenHash: session.tokenHash,
              expiresAt: session.expiresAt,
              userAgent,
            },
          },
        },

        select: publicUserSelect,
      });

      return {
        user,
        session: {
          token: session.token,
          expiresAt: session.expiresAt,
          persistent: session.persistent,
        },
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username or email is already in use');
      }

      throw error;
    }
  }

  async login(input: LoginInput) {
    if (!input || typeof input !== 'object') {
      throw new UnauthorizedException('Invalid login or password');
    }

    const login = normalizeIdentifier(input.login);
    const password = typeof input.password === 'string' ? input.password : '';

    if (!login || !password) {
      throw new UnauthorizedException('Invalid login or password');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        authProvider: 'STANDARD',
        OR: [{ username: login }, { email: login }],
      },
      include: {
        credential: true,
      },
    });

    const passwordHash =
      user?.credential?.passwordHash ?? (await dummyPasswordHash);
    const passwordIsValid = await verifyPassword(password, passwordHash);

    if (!user?.credential || !passwordIsValid) {
      throw new UnauthorizedException('Invalid login or password');
    }

    if (passwordNeedsRehash(user.credential.passwordHash)) {
      await this.prisma.passwordCredential.update({
        where: {
          userId: user.id,
        },
        data: {
          passwordHash: await hashPassword(password),
        },
      });
    }

    return {
      id: user.id,
      name: user.name,

      firstName: user.firstName,
      lastName: user.lastName,

      username: user.username,
      email: user.email,

      role: user.role,
      groupNumber: user.groupNumber,

      authProvider: user.authProvider,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createSession(
    userId: number,
    rememberMe: boolean,
    userAgent?: string,
  ) {
    const session = createSessionDetails(rememberMe);

    await this.prisma.$transaction([
      this.prisma.authSession.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      }),
      this.prisma.authSession.create({
        data: {
          tokenHash: session.tokenHash,
          expiresAt: session.expiresAt,
          userId,
          userAgent,
        },
      }),
    ]);

    return {
      token: session.token,
      expiresAt: session.expiresAt,
      persistent: session.persistent,
    };
  }

  async findUserBySession(token: string, userAgent?: string) {
    const session = await this.prisma.authSession.findUnique({
      where: {
        tokenHash: hashSessionToken(token),
      },
      select: {
        id: true,
        expiresAt: true,
        lastActiveAt: true,
        userAgent: true,
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await this.prisma.authSession.deleteMany({
          where: {
            id: session.id,
          },
        });
      }

      throw new UnauthorizedException('Authentication required');
    }

    const now = new Date();

    const shouldRefreshActivity =
      now.getTime() - session.lastActiveAt.getTime() >= 60_000;
    const shouldSaveUserAgent = !session.userAgent && Boolean(userAgent);

    if (shouldRefreshActivity || shouldSaveUserAgent) {
      await this.prisma.authSession.update({
        where: {
          id: session.id,
        },
        data: {
          ...(shouldRefreshActivity ? { lastActiveAt: now } : {}),
          ...(shouldSaveUserAgent ? { userAgent } : {}),
        },
      });
    }

    return session.user;
  }

  async getSessions(userId: number, currentToken: string) {
    const currentTokenHash = hashSessionToken(currentToken);
    const now = new Date();
    const onlineThreshold = now.getTime() - 5 * 60 * 1000;

    const sessions = await this.prisma.authSession.findMany({
      where: {
        userId,
        expiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
        tokenHash: true,
        userAgent: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      ...getDeviceDetails(session.userAgent),
      current: session.tokenHash === currentTokenHash,
      online: session.lastActiveAt.getTime() >= onlineThreshold,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
    }));
  }

  async deleteSession(token: string) {
    await this.prisma.authSession.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  async deleteAllSessions(userId: number) {
    await this.prisma.authSession.deleteMany({
      where: {
        userId,
      },
    });
  }

  async changePassword(userId: number, input: ChangePasswordInput) {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('Password data is required');
    }

    const currentPassword =
      typeof input.currentPassword === 'string' ? input.currentPassword : '';
    const newPassword =
      typeof input.newPassword === 'string' ? input.newPassword : '';

    if (!currentPassword) {
      throw new BadRequestException('Current password is required');
    }

    validatePassword(newPassword);

    const credential = await this.prisma.passwordCredential.findUnique({
      where: {
        userId,
      },
      select: {
        passwordHash: true,
      },
    });

    if (
      !credential ||
      !(await verifyPassword(currentPassword, credential.passwordHash))
    ) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (await verifyPassword(newPassword, credential.passwordHash)) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    await this.prisma.passwordCredential.update({
      where: {
        userId,
      },
      data: {
        passwordHash: await hashPassword(newPassword),
      },
    });
  }

  async updateProfile(userId: number, input: UpdateProfileInput) {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('Profile data is required');
    }

    const firstName = normalizeString(input.firstName);

    const lastName = normalizeString(input.lastName);

    const name = `${firstName} ${lastName}`;

    const username = normalizeIdentifier(input.username);

    const email = normalizeIdentifier(input.email);

    if (!firstName || firstName.length > 50) {
      throw new BadRequestException('First name has an invalid format');
    }

    if (!lastName || lastName.length > 50) {
      throw new BadRequestException('Last name has an invalid format');
    }

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      throw new BadRequestException('Username has an invalid format');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new BadRequestException('Email has an invalid format');
    }

    const allowedRoles = new Set([
      'STUDENT',
      'POSTGRADUATE',
      'EMPLOYEE',
    ]);

    if (!allowedRoles.has(input.role)) {
      throw new BadRequestException('Role has an invalid value');
    }

    const isStudent = input.role === 'STUDENT';

    const groupNumber = isStudent ? normalizeString(input.groupNumber) : null;

    const allowedGroups = new Set(['321', '421', '521', '621']);

    if (isStudent && !allowedGroups.has(groupNumber ?? '')) {
      throw new BadRequestException('Student group has an invalid value');
    }

    const [userWithSameUsername, userWithSameEmail] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          username,
          id: {
            not: userId,
          },
        },

        select: {
          id: true,
        },
      }),

      this.prisma.user.findFirst({
        where: {
          email,
          id: {
            not: userId,
          },
        },

        select: {
          id: true,
        },
      }),
    ]);

    const conflicts: Array<{
      field: 'username' | 'email';
      message: string;
    }> = [];

    if (userWithSameUsername) {
      conflicts.push({
        field: 'username',
        message: 'Username is already in use',
      });
    }

    if (userWithSameEmail) {
      conflicts.push({
        field: 'email',
        message: 'Email is already in use',
      });
    }

    if (conflicts.length > 0) {
      throw new ConflictException({
        message: 'Profile data conflict',
        errors: conflicts,
      });
    }

    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          name,

          firstName,
          lastName,

          username,
          email,

          role: input.role,
          groupNumber,
        },

        select: publicUserSelect,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username or email is already in use');
      }

      throw error;
    }
  }
}
