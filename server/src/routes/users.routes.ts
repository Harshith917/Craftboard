import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { UsersService } from '../services/users.service';
import { asyncHandler, ConflictException, BadRequestException, NotFoundException } from '../lib/errors';
import { createClerkClient } from '@clerk/backend';

export const usersRouter = Router();

const svc = new UsersService();
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

usersRouter.use(requireAuth);

usersRouter.post('/sync', asyncHandler(async (req, res) => {
  const clerkUserId = req.userId;
  const clerkUser = await clerk.users.getUser(clerkUserId);
  res.json(
    await svc.upsertUser({
      id: clerkUser.id,
      email:
        clerkUser.emailAddresses[0]?.emailAddress ?? `user-${clerkUser.id}@placeholder.dev`,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      imageUrl: clerkUser.imageUrl,
    }),
  );
}));

usersRouter.get('/me', asyncHandler(async (req, res) => {
  const profile = await svc.getProfile(req.userId);
  if (!profile) throw new NotFoundException('User not found');
  res.json(profile);
}));

usersRouter.get('/profile/:id', asyncHandler(async (req, res) => {
  const profile = await svc.getPublicProfile(req.params.id, req.userId);
  if (!profile) throw new NotFoundException('User not found');
  res.json(profile);
}));

usersRouter.get('/check-username/:username', asyncHandler(async (req, res) => {
  const available = await svc.isUsernameAvailable(req.params.username);
  res.json({ available });
}));

usersRouter.get('/me/projects/owned', asyncHandler(async (req, res) => {
  const projects = await svc.getOwnedProjects(req.userId);
  res.json(
    projects.map((p) => ({
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
      role: 'owner',
    })),
  );
}));

usersRouter.get('/me/projects/shared', asyncHandler(async (req, res) => {
  const projects = await svc.getSharedProjects(req.userId);
  res.json(
    projects.map((p: any) => ({
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
      role: p.myRole,
      joinedAt: p.joinedAt,
    })),
  );
}));

usersRouter.get('/me/activity', asyncHandler(async (req, res) => {
  res.json(await svc.getActivity(req.userId));
}));

usersRouter.patch('/me', asyncHandler(async (req, res) => {
  try {
    res.json(await svc.updateProfile(req.userId, req.body));
  } catch (err: any) {
    if (err.message === 'Username already taken') {
      throw new ConflictException('Username already taken');
    }
    throw new BadRequestException(err.message);
  }
}));

usersRouter.patch('/me/privacy', asyncHandler(async (req, res) => {
  res.json(await svc.updatePrivacy(req.userId, req.body));
}));

usersRouter.post('/me/online', asyncHandler(async (req, res) => {
  res.json(await svc.updateOnlineStatus(req.userId, req.body.isOnline));
}));

usersRouter.post('/me/active', asyncHandler(async (req, res) => {
  res.json(await svc.touchLastActive(req.userId));
}));

usersRouter.get('/:id/projects', asyncHandler(async (req, res) => {
  res.json(await svc.getPublicProjects(req.params.id, req.userId));
}));
