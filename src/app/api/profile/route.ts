import { NextRequest } from 'next/server';
import { handleProtectedRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { userController } from '@/lib/controllers/UserController';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const GET = handleProtectedRoute(async (request: NextRequest, { user }) => {
  if (!user?.id) {
    throw new Error('Invalid user session');
  }
  
  const result = await userController.getCurrentUser(user.id);
  return handleApiResponse(result, user.email);
}, {
  requiredPermissions: [PERMISSIONS.PROFILE_READ]
});

export const PUT = handleProtectedRoute(async (request: NextRequest, { user }) => {
  if (!user?.id) {
    throw new Error('Invalid user session');
  }

  const body = await request.json();

  const { 
    id, 
    email, 
    passwordHash, 
    passwordConfirmation, 
    isActive, 
    isVerified, 
    createdAt, 
    updatedAt, 
    ...updateData 
  } = body;

  const allowedFields = {
    name: body.name,
    code: body.code,
    ...updateData
  };

  const cleanedData = Object.fromEntries(
    Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
  );

  const result = await userController.update(user.id, cleanedData);
  return handleApiResponse(result, user.email);
}, {
  requiredPermissions: [PERMISSIONS.PROFILE_UPDATE]
});

export const DELETE = handleProtectedRoute(async (request: NextRequest, { user }) => {
  if (!user?.id) {
    throw new Error('Invalid user session');
  }

  const result = await userController.updateStatus(user.id, false);
  
  if (result.success) {
    const { NextResponse } = await import('next/server');
    const response = NextResponse.json({
      success: true,
      data: true,
      message: 'Account deactivated successfully'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;
  }

  return handleApiResponse(result, user.email);
}, {
  requiredPermissions: [PERMISSIONS.PROFILE_UPDATE]
});
