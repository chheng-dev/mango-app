import { NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { protectRoute } from '@/lib/auth/unified';

type Params = {
  params: { 
    id: string;
  };
}

export const GET = protectRoute(async (request, { user, params }) => {
  const userId = Number(params?.id);

  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const result = await userController.getById(userId);
  return handleApiResponse(result, user?.email);
});


export const POST = protectRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const body = await request.json();
  
  return NextResponse.json({
    success: false,
    error: 'Role assignment not implemented yet'
  }, { status: 501 });
});

export const PUT = protectRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const { roles, permissions } = await request.json();
  
  if (!Array.isArray(roles) && !Array.isArray(permissions)) {
    return BaseRoute.errorResponse('Either roles or permissions array is required', 400);
  }

  return NextResponse.json({ 
    success: false, 
    error: 'Bulk update not implemented yet' 
  }, { status: 501 });
});

export const DELETE = protectRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }
  
  return NextResponse.json({
    success: false,
    error: 'Role removal not implemented yet'
  }, { status: 501 });
});
