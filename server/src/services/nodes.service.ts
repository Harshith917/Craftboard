import { prisma } from '../lib/prisma';
import { ForbiddenException } from '../lib/errors';

export class NodesService {
  private async verifyPageOwnership(pageId: string, userId: string) {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        project: {
          select: {
            ownerId: true,
            members: {
              where: { userId },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!page) throw new ForbiddenException('Page not found');

    const isOwner = page.project.ownerId === userId;
    const isMember = page.project.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    return page;
  }

  async getNodes(pageId: string, userId: string) {
    await this.verifyPageOwnership(pageId, userId);
    return prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
  }

  async saveNodes(pageId: string, nodes: any[], userId: string) {
    await this.verifyPageOwnership(pageId, userId);
    return this.replaceNodes(pageId, nodes);
  }

  async saveNodesFromWebhook(pageId: string, nodes: any[]) {
    return this.replaceNodes(pageId, nodes);
  }

  private async replaceNodes(pageId: string, nodes: any[]) {
    await prisma.node.deleteMany({ where: { pageId } });

    if (nodes.length > 0) {
      await prisma.node.createMany({
        data: nodes.map((node) => ({ ...node, pageId })),
      });
    }

    return prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
  }
}
