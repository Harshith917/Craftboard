import { prisma } from '../lib/prisma';
import { ForbiddenException, NotFoundException } from '../lib/errors';
import { MemberRole } from '../../generated/prisma/enums';

export class PageService {
  private async verifyOwnership(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId === userId) return project;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership) throw new ForbiddenException('Access denied');

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
      prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      prisma.page.count({ where }),
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
    const count = await prisma.page.count({ where: { projectId } });
    return prisma.page.create({
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

    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId },
    });
    if (!page) throw new NotFoundException('Page not found');

    return prisma.page.update({
      where: { id: pageId },
      data: { name: data.name },
    });
  }

  async deletePage(projectId: string, pageId: string, userId: string) {
    await this.verifyOwnership(projectId, userId);

    const pages = await prisma.page.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });

    if (pages.length === 1)
      throw new ForbiddenException('Cannot delete the last page');

    const target = pages.find((p) => p.id === pageId);
    if (!target) throw new NotFoundException('Page not found');

    await prisma.$transaction(async (tx) => {
      await tx.page.delete({ where: { id: pageId } });
      const remaining = pages.filter((p) => p.id !== pageId);
      await Promise.all(
        remaining.map((p, i) =>
          tx.page.update({ where: { id: p.id }, data: { order: i } }),
        ),
      );
    });

    return { success: true };
  }

  async getMyRole(
    pageId: string,
    userId: string,
  ): Promise<{ role: MemberRole }> {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        projectId: true,
        project: { select: { ownerId: true } },
      },
    });
    if (!page) throw new NotFoundException('Page not found');

    if (page.project.ownerId === userId) {
      return { role: MemberRole.owner };
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: page.projectId, userId },
      },
      select: { role: true },
    });

    if (!member) throw new ForbiddenException('No access to this page');

    return { role: member.role };
  }
}
