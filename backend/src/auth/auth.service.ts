import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { LoginInput, RegisterInput } from './auth.types.js';
import { hashPassword, verifyPassword } from './password.js';

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

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterInput) {
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
      'BACHELOR_STUDENT',
      'MASTER_STUDENT',
      'POSTGRADUATE',
      'EMPLOYEE',
    ]);

    if (!allowedRoles.has(input.role)) {
      throw new BadRequestException('Role has an invalid value');
    }

    const isStudent =
      input.role === 'BACHELOR_STUDENT' || input.role === 'MASTER_STUDENT';

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

    try {
      return await this.prisma.user.create({
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

  async login(input: LoginInput) {
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

    if (
      !user?.credential ||
      !(await verifyPassword(password, user.credential.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid login or password');
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

  async createSession(userId: number, rememberMe: boolean) {
    const token = randomBytes(32).toString('base64url');
    const duration = rememberMe
      ? REMEMBERED_SESSION_DURATION_MS
      : SESSION_DURATION_MS;
    const expiresAt = new Date(Date.now() + duration);

    await this.prisma.authSession.create({
      data: {
        tokenHash: hashSessionToken(token),
        expiresAt,
        userId,
      },
    });

    return {
      token,
      expiresAt,
      persistent: rememberMe,
    };
  }

  async findUserBySession(token: string) {
    const session = await this.prisma.authSession.findUnique({
      where: {
        tokenHash: hashSessionToken(token),
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!session || session.expiresAt <= new Date()) {
      if (session) {
        await this.prisma.authSession.delete({
          where: {
            id: session.id,
          },
        });
      }

      throw new UnauthorizedException('Authentication required');
    }

    return session.user;
  }

  async deleteSession(token: string) {
    await this.prisma.authSession.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }
}
