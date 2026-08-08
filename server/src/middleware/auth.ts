import { verifyToken } from '@clerk/backend';
import { UnauthorizedException } from '../lib/errors';

// Express middleware replacing ClerkAuthGuard.
export async function requireAuth(req: any, res: any, next: any) {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] ?? req.cookies?.['__session'];

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      req.userId = payload.sub;
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  } catch (err) {
    next(err);
  }
}
