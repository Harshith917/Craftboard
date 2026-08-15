import { prisma } from '../lib/prisma';
import { NotificationsService } from './notifications.service';
import { notifyUser } from '../lib/gateway';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '../lib/errors';
import { MemberRole } from '../../generated/prisma/enums';

export class ProjectMembersService {
  private notifications = new NotificationsService();

  async list(projectId: string) {
    const [owner, members] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      }),
      prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      }),
    ]);

    return [
      { ...owner!.User, role: MemberRole.owner, joinedAt: owner!.createdAt },
      ...members.map((m) => ({
        ...m.user,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    ];
  }

  async getMyRole(
    projectId: string,
    userId: string,
  ): Promise<MemberRole | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    if (!project) return null;
    if (project.ownerId === userId) return MemberRole.owner;

    const m = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return m?.role ?? null;
  }

  async updateRole(
    projectId: string,
    targetUserId: string,
    role: MemberRole,
    requesterId: string,
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== requesterId) {
      throw new ForbiddenException('Only the owner can change roles');
    }
    if (targetUserId === requesterId) {
      throw new BadRequestException('Cannot change your own role');
    }
    if (role === MemberRole.owner) {
      throw new BadRequestException(
        'Ownership can only be transferred through the transfer ownership flow',
      );
    }
    if (![MemberRole.viewer, MemberRole.editor].includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const updated = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId: targetUserId } },
      data: { role },
      include: { user: true },
    });
    this.notifications.create({
      userId: targetUserId,
      actorId: requesterId,
      type: 'role_changed',
      title: 'Role Updated',
      message: `Your role in the project has been changed to ${role}`,
      projectId,
      metadata: { newRole: role, changedBy: requesterId },
    });
    notifyUser(targetUserId, 'project-role-changed', { projectId, role });
    return updated;
  }

  async remove(projectId: string, targetUserId: string, requesterId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const isOwner = project.ownerId === requesterId;
    const isSelf = targetUserId === requesterId;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException('You can only remove yourself');
    }
    if (isOwner && isSelf) {
      throw new BadRequestException('Owner cannot leave the project');
    }

    const _removed = await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: targetUserId } },
      include: { user: true },
    });
    if (!isSelf) {
      this.notifications.create({
        userId: targetUserId,
        actorId: requesterId,
        type: 'member_removed',
        title: 'Removed from Project',
        message: `You were removed from ${project.name || 'the project'}`,
        projectId,
        metadata: { removedBy: requesterId },
      });
    }
    return { ok: true };
  }
}
