import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { UsersService } from './users.service';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

@Controller('users')
@UseGuards(ClerkAuthGuard) // all routes here require a valid Clerk token
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async syncUser(@Req() req: Request) {
    const clerkUserId = req['clerkUserId'];

    // Fetch full user data from Clerk
    const clerkUser = await clerk.users.getUser(clerkUserId);

    return this.usersService.upsertUser({
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      imageUrl: clerkUser.imageUrl,
    });
  }
}
