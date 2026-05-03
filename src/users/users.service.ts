import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertUser(data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    return this.prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
      },
      create: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        imageUrl: data.imageUrl,
      },
    });
  }

  async getUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
