import { prisma } from '../lib/prisma';
import { ForbiddenException } from '../lib/errors';

// Fallback values used only for rows written before the `data` JSON column
// existed, so legacy nodes still round-trip to a valid client Node shape.
const LEGACY_DEFAULTS = {
  visible: true,
  locked: false,
  name: '',
  cornerRadius: 0,
  sides: 3,
  outerRadius: 0,
  innerRadius: 0,
  fontStyle: 'normal',
  fontWeight: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  letterSpacing: 0,
  lineHeight: 1,
  shadowColor: 'rgba(0,0,0,0.5)',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowOpacity: 0.5,
  blurRadius: 0,
  dividerOrientation: 'horizontal',
} as const;

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

  // Maps a client Node into the typed columns (kept for queryability) and
  // stores the full object in `data` so no fields are lost on round-trip.
  private toRow(pageId: string, node: any) {
    return {
      id: node.id,
      parentId: node.parentId ?? null,
      pageId,
      type: node.type ?? 'rect',
      x: node.x ?? 0,
      y: node.y ?? 0,
      width: node.width ?? 100,
      height: node.height ?? 100,
      radius: node.radius ?? 0,
      text: node.text ?? null,
      fill: node.fill ?? '#ffffff',
      stroke: node.stroke ?? '#000000',
      strokeWidth: node.strokeWidth ?? 1,
      strokeStyle: node.strokeStyle ?? 'solid',
      rotation: node.rotation ?? 0,
      opacity: node.opacity ?? 1,
      fontSize: node.fontSize ?? 14,
      fontFamily: node.fontFamily ?? 'Arial',
      zIndex: node.zIndex ?? 0,
      imageUrl: node.imageUrl ?? null,
      points: node.points ?? [],
      data: node,
    };
  }

  private serializeRow(row: any) {
    if (row.data) return row.data;
    const { data, pageId, createdAt, updatedAt, ...rest } = row;
    return { ...LEGACY_DEFAULTS, ...rest };
  }

  private async getNodesForPage(pageId: string) {
    const rows = await prisma.node.findMany({
      where: { pageId },
      orderBy: { zIndex: 'asc' },
    });
    return rows.map((row) => this.serializeRow(row));
  }

  private async replaceNodes(pageId: string, nodes: any[]) {
    await prisma.$transaction(async (tx) => {
      await tx.node.deleteMany({ where: { pageId } });
      if (nodes.length > 0) {
        await tx.node.createMany({
          data: nodes.map((node) => this.toRow(pageId, node)),
        });
      }
    });
    return this.getNodesForPage(pageId);
  }

  async getNodes(pageId: string, userId: string) {
    await this.verifyPageOwnership(pageId, userId);
    return this.getNodesForPage(pageId);
  }

  async saveNodes(pageId: string, nodes: any[], userId: string) {
    await this.verifyPageOwnership(pageId, userId);
    return this.replaceNodes(pageId, nodes);
  }

  async saveNodesFromWebhook(pageId: string, nodes: any[]) {
    return this.replaceNodes(pageId, nodes);
  }
}
