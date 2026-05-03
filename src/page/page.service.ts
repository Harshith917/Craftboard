import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PageService {
  constructor(private prisma: PrismaService) {}

  private async verifyOwnership(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project)
      throw new ForbiddenException('Project not found or access denied');
    return project;
  }

  async getPages(
    projectId: string,
    userId: string,
    { page, limit, search }: { page: number; limit: number; search: string },
  ) {
    await this.verifyOwnership(projectId, userId);

    const skip = (page - 1) * limit;

    const where = {
      projectId,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prisma.page.count({ where }),
    ]);

    return {
      data: pages,
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

  async createPage(projectId: string, userId: string) {
    await this.verifyOwnership(projectId, userId);
    const count = await this.prisma.page.count({ where: { projectId } });
    return this.prisma.page.create({
      data: {
        name: `Page ${count + 1}`,
        order: count,
        project: { connect: { id: projectId } },
      },
    });
  }

  async updatePage(
    projectId: string,
    pageId: string,
    data: { name: string },
    userId: string,
  ) {
    await this.verifyOwnership(projectId, userId);
    return this.prisma.page.update({
      where: { id: pageId },
      data: { name: data.name },
    });
  }

  async deletePage(projectId: string, pageId: string, userId: string) {
    await this.verifyOwnership(projectId, userId);

    const pages = await this.prisma.page.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    if (pages.length === 1)
      throw new ForbiddenException('Cannot delete the last page');

    await this.prisma.page.delete({ where: { id: pageId } });

    const remaining = pages.filter((p) => p.id !== pageId);
    await Promise.all(
      remaining.map((p, i) =>
        this.prisma.page.update({ where: { id: p.id }, data: { order: i } }),
      ),
    );

    return { success: true };
  }
}
