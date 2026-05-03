import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NodesService {
  constructor(private prisma: PrismaService) {}

  private async verifyPageOwnership(pageId: string, userId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, project: { ownerId: userId } },
    });
    if (!page) throw new ForbiddenException('Page not found or access denied');
    return page;
  }

  async getNodes(pageId: string, userId: string) {
    await this.verifyPageOwnership(pageId, userId);
    return this.prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
  }

  // replaces all nodes on the page with the new set
  async saveNodes(pageId: string, nodes: any[], userId: string) {
    await this.verifyPageOwnership(pageId, userId);

    const saved = await this.prisma.$transaction([
      this.prisma.node.deleteMany({ where: { pageId } }),
      ...nodes.map((node) =>
        this.prisma.node.create({ data: { ...node, pageId } }),
      ),
    ]);

    return this.prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
  }
}
