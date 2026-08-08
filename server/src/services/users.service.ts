import { prisma } from '../lib/prisma';
import { notifyUser, broadcastToAll } from '../lib/gateway';

export class UsersService {
  async upsertUser(data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    return prisma.user.upsert({
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

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            projects: true,
            memberships: true,
          },
        },
      },
    });
    if (!user) return null;

    const ownedProjects = await prisma.project.count({
      where: { ownerId: userId },
    });

    const joinedProjects = await prisma.projectMember.count({
      where: { userId, project: { ownerId: { not: userId } } },
    });

    const pagesCreated = await prisma.page.count({
      where: { project: { ownerId: userId } },
    });

    const collaborations = await prisma.projectMember.count({
      where: { userId },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      isOnline: user.isOnline,
      profileVisibility: user.profileVisibility,
      showEmail: user.showEmail,
      stats: {
        projectsOwned: ownedProjects,
        projectsJoined: joinedProjects,
        pagesCreated,
        totalCollaborations: collaborations,
        lastActive: user.lastActiveAt,
      },
    };
  }

  async getPublicProfile(userId: string, viewerId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;
    if (user.profileVisibility === 'private' && viewerId !== userId) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        displayName: user.displayName,
        isOnline: user.isOnline,
      };
    }
    return this.getProfile(userId);
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string; bio?: string; imageUrl?: string; username?: string },
  ) {
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.username !== undefined) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existing && existing.id !== userId) {
        throw new Error('Username already taken');
      }
      updateData.username = data.username;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    notifyUser(userId, 'profile-updated', {
      id: user.id,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      bio: user.bio,
      username: user.username,
    });

    broadcastToAll('collaborator-profile-updated', {
      id: user.id,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      bio: user.bio,
    });

    return user;
  }

  async updatePrivacy(
    userId: string,
    data: { profileVisibility?: 'public' | 'private'; showEmail?: boolean },
  ) {
    const updateData: any = {};
    if (data.profileVisibility !== undefined) updateData.profileVisibility = data.profileVisibility;
    if (data.showEmail !== undefined) updateData.showEmail = data.showEmail;
    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async updateOnlineStatus(userId: string, isOnline: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isOnline, lastActiveAt: isOnline ? undefined : new Date() },
    });
    broadcastToAll('user-online-status', {
      userId,
      isOnline,
    });
    return user;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return !user;
  }

  async touchLastActive(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }

  async getPublicProjects(targetUserId: string, viewerId: string) {
    const projects = await prisma.project.findMany({
      where: {
        ownerId: targetUserId,
        visibility: 'public',
      },
      include: {
        User: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
        _count: { select: { members: true, pages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const viewerMemberships = await prisma.projectMember.findMany({
      where: { userId: viewerId },
      select: { projectId: true, role: true },
    });
    const membershipMap = new Map(viewerMemberships.map((m) => [m.projectId, m.role]));

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      thumbnail: p.thumbnail,
      visibility: p.visibility,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      owner: p.User,
      memberCount: p._count.members,
      pagesCount: p._count.pages,
      role: membershipMap.get(p.id) || null,
    }));
  }

  async getOwnedProjects(userId: string) {
    return prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        User: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
        _count: { select: { members: true, pages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getSharedProjects(userId: string) {
    const memberships = await prisma.projectMember.findMany({
      where: { userId, project: { ownerId: { not: userId } } },
      include: {
        project: {
          include: {
            User: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
            _count: { select: { members: true, pages: true } },
          },
        },
      },
      orderBy: { project: { updatedAt: 'desc' } },
    });
    return memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async getActivity(userId: string) {
    const [recentJoins, recentPages] = await Promise.all([
      prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              User: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
        take: 5,
      }),
      prisma.pageVisit.findMany({
        where: { userId },
        include: {
          page: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { visitedAt: 'desc' },
        take: 5,
        distinct: ['pageId'],
      }),
    ]);

    return {
      recentlyJoined: recentJoins.map((j) => ({
        projectId: j.project.id,
        projectName: j.project.name,
        projectThumbnail: j.project.thumbnail,
        owner: j.project.User,
        joinedAt: j.joinedAt,
        role: j.role,
      })),
      recentlyEdited: recentPages.map((v) => ({
        pageId: v.page.id,
        pageName: v.page.name,
        projectId: v.project.id,
        projectName: v.project.name,
        visitedAt: v.visitedAt,
      })),
    };
  }
}
