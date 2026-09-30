import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  create(name: string, email: string) {
    return this.prisma.user.create({
      data: {
        name,
        email,
      },
    });
  }
}
