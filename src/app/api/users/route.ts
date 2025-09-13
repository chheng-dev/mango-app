import { userController } from '@/lib/controllers/UserController';
import { createApiHandler } from '@/lib/api/BaseApiHandler';
import { AuthenticatedRequest, withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  return createApiHandler(userController).GET(request);
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  return createApiHandler(userController).POST(request);
});