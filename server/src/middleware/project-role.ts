import { prisma } from '../lib/prisma';
import { ForbiddenException, NotFoundException } from '../lib/errors';
import type { MemberRole } from '../../generated/prisma/client';

const HIERARCHY: Record<MemberRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

// Express middleware replacing ProjectRoleGuard + @ProjectRoles(...).
export function requireProjectRole(...required: MemberRole[]) {
  if (!required.length) {
    return (req: any, res: any, next: any) => next();
  }

  return async (req: any, res: any, next: any) => {
    try {
      const userId: string = req.userId;

      let projectId: string | undefined =
        req.params.projectId ?? req.body?.projectId;

      if (!projectId && req.params.id) {
        projectId = req.params.id;
      }

      if (!projectId && req.params.pageId) {
        const page = await prisma.page.findUnique({
          where: { id: req.params.pageId },
          select: { projectId: true },
        });
        if (!page) throw new NotFoundException('Page not found');
        projectId = page.projectId;
      }

      if (!userId || !projectId) {
        throw new ForbiddenException('Missing auth or project context');
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true },
      });
      if (!project) throw new NotFoundException('Project not found');
      if (project.ownerId === userId) {
        req.projectRole = 'owner';
        next();
        return;
      }

      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!member) throw new ForbiddenException('Not a member of this project');

      const userLevel = HIERARCHY[member.role];
      const minRequired = Math.min(...required.map((r) => HIERARCHY[r]));

      if (userLevel < minRequired) {
        throw new ForbiddenException(
          `Requires at least ${required.join(' or ')} role`,
        );
      }

      req.projectRole = member.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
