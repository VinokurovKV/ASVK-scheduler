import { BadRequestException, ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma.service.js';
import { SystemService } from './system.service.js';

const createPrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
});

describe('SystemService role management', () => {
  it('assigns the group leader role to a user with a group', async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      groupNumber: '421',
      appRoles: [],
    });
    prisma.user.update.mockResolvedValue({
      id: 2,
      appRoles: ['GROUP_LEADER'],
    });
    const service = new SystemService(prisma as unknown as PrismaService);

    await expect(
      service.updateUserAppRoles(2, { appRoles: ['GROUP_LEADER'] }),
    ).resolves.toEqual({ id: 2, appRoles: ['GROUP_LEADER'] });
  });

  it('does not assign the group leader role without a group', async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      groupNumber: null,
      appRoles: [],
    });
    const service = new SystemService(prisma as unknown as PrismaService);

    await expect(
      service.updateUserAppRoles(2, { appRoles: ['GROUP_LEADER'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not remove the last owner', async () => {
    const prisma = createPrismaMock();
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      groupNumber: '421',
      appRoles: ['OWNER'],
    });
    prisma.user.count.mockResolvedValue(1);
    const service = new SystemService(prisma as unknown as PrismaService);

    await expect(
      service.updateUserAppRoles(1, { appRoles: [] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects unknown application roles', async () => {
    const prisma = createPrismaMock();
    const service = new SystemService(prisma as unknown as PrismaService);

    await expect(
      service.updateUserAppRoles(2, {
        appRoles: ['ADMIN' as 'OWNER'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
