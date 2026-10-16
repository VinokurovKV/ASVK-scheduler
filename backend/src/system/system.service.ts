import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import type { AppRole, UpdateUserAppRolesInput } from './system.types.js';

const allowedAppRoles = new Set<AppRole>(['GROUP_LEADER', 'OWNER']);

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  findUsers() {
    const now = new Date();

    return this.prisma.user.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        groupNumber: true,
        appRoles: true,
        authProvider: true,
        _count: {
          select: {
            sessions: {
              where: { expiresAt: { gt: now } },
            },
          },
        },
      },
    });
  }

  async updateUserAppRoles(
    userId: number,
    input: UpdateUserAppRolesInput,
  ) {
    if (!input || !Array.isArray(input.appRoles)) {
      throw new BadRequestException('App roles are required');
    }

    const appRoles = [...new Set(input.appRoles)];

    if (appRoles.some((role) => !allowedAppRoles.has(role))) {
      throw new BadRequestException('App role has an invalid value');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        groupNumber: true,
        appRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (appRoles.includes('GROUP_LEADER') && !user.groupNumber) {
      throw new BadRequestException('Group leader must belong to a group');
    }

    if (
      user.appRoles.includes('OWNER') &&
      !appRoles.includes('OWNER')
    ) {
      const ownersCount = await this.prisma.user.count({
        where: { appRoles: { has: 'OWNER' } },
      });

      if (ownersCount <= 1) {
        throw new ConflictException('The last owner cannot be removed');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { appRoles: { set: appRoles } },
      select: {
        id: true,
        appRoles: true,
      },
    });
  }
}
