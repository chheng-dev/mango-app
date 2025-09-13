import { userController } from '@/lib/controllers/UserController';
import { createApiHandler } from '@/lib/api/BaseApiHandler';

const api = createApiHandler(userController);

export const GET = api.GET;
export const PUT = api.PUT;
export const DELETE = api.DELETE;
export const PATCH = api.PATCH;
