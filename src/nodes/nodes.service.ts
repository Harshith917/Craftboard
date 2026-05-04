import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

interface Delta {
  upserts: Omit<Prisma.NodeCreateManyInput, 'pageId'>[];
  deletes: string[];
}

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

  async saveNodes(
    pageId: string,
    nodes: Prisma.NodeCreateManyInput[],
    userId: string,
  ) {
    await this.verifyPageOwnership(pageId, userId);

    await this.prisma.node.deleteMany({ where: { pageId } });

    if (nodes.length > 0) {
      await this.prisma.node.createMany({
        data: nodes.map((node) => ({ ...node, pageId })),
      });
    }

    return this.prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
  }

  async patchNodes(pageId: string, delta: Delta, userId: string) {
    await this.verifyPageOwnership(pageId, userId);

    const { upserts, deletes } = delta;
    const idsToDelete = [
      ...deletes,
      ...upserts
        .map((n) => n.id)
        .filter((id): id is string => id !== undefined),
    ];

    if (idsToDelete.length > 0) {
      await this.prisma.node.deleteMany({
        where: { id: { in: idsToDelete }, pageId },
      });
    }

    if (upserts.length > 0) {
      await this.prisma.node.createMany({
        data: upserts.map((node) => ({
          ...node,
          pageId,
        })) as Prisma.NodeCreateManyInput[],
      });
    }

    return this.prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
  }
}
