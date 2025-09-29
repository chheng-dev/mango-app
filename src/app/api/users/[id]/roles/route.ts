import { NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, handleApiResponse, createProtectedRoute } from '@/lib/utils/BaseRoute';
import { PERMISSIONS } from '@/lib/constants/permissions';

type Params = {
  params: { 
    id: string;
  };
}

export const GET = createProtectedRoute(async (request, { user, params }) => {
  const userId = Number(params?.id);

  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const result = await userController.getById(userId);
  return handleApiResponse(result, user?.email);
}, {
  requiredPermissions: [PERMISSIONS.USER_READ] 
});


export const POST = createProtectedRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const body = await request.json();
  
  return NextResponse.json({
    success: false,
    error: 'Role assignment not implemented yet'
  }, { status: 501 });
}, {
  requiredPermissions: [PERMISSIONS.ROLE_CREATE]
});

export const PUT = createProtectedRoute(async (request, { user, params }) => {
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
}, {
  requiredPermissions: [PERMISSIONS.ROLE_UPDATE]
});

export const DELETE = createProtectedRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');
  
  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  const { searchParams } = new URL(request.url);
  
  return NextResponse.json({
    success: false,
    error: 'Role removal not implemented yet'
  }, { status: 501 });
}, {
  requiredPermissions: [PERMISSIONS.ROLE_DELETE]
});
