import { prisma } from '../lib/prisma';
import { notifyUser } from '../lib/gateway';

interface CreateNotificationDto {
  userId: string;
  actorId?: string;
  type: string;
  title: string;
  message?: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

interface FindByUserOptions {
  page?: number;
  limit?: number;
  filter?: string;
  search?: string;
  type?: string;
}

export class NotificationsService {
  async create(data: CreateNotificationDto) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        title: data.title,
        message: data.message,
        projectId: data.projectId,
        metadata: data.metadata as any,
      },
    });

    const count = await this.unreadCount(data.userId);

    notifyUser(data.userId, 'notification:new', notification);
    notifyUser(data.userId, 'notification:count-updated', { count });

    return notification;
  }

  async findByUser(userId: string, opts: FindByUserOptions = {}) {
    const { page = 1, limit = 20, filter, search, type } = opts;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filter === 'unread') {
      where.read = false;
    } else if (filter === 'read') {
      where.read = true;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { message: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async unreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });

    const count = await this.unreadCount(userId);

    notifyUser(userId, 'notification:read', {
      notificationId,
      count,
    });
    notifyUser(userId, 'notification:count-updated', { count });

    return result;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    const count = await this.unreadCount(userId);

    notifyUser(userId, 'notification:read-all', { count });
    notifyUser(userId, 'notification:count-updated', { count });

    return result;
  }

  async delete(userId: string, notificationId: string) {
    const result = await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });

    const count = await this.unreadCount(userId);

    notifyUser(userId, 'notification:deleted', {
      notificationId,
      count,
    });
    notifyUser(userId, 'notification:count-updated', { count });

    return result;
  }
}
