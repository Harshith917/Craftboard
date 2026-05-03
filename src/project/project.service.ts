import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GetProjectsParams {
  ownerId: string;
  page: number;
  limit: number;
  search: string;
}

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async getProjects({ ownerId, page, limit, search }: GetProjectsParams) {
    const skip = (page - 1) * limit;

    const where = {
      ownerId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  getProjectById(id: string, ownerId: string) {
    return this.prisma.project.findFirst({
      where: { id, ownerId },
    });
  }

  createProject(data: any, ownerId: string) {
    return this.prisma.project.create({
      data: {
        ...data,
        ownerId,
      },
    });
  }
}
