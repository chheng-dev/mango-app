import { protectRoute } from '@/lib/auth/unified';
import { userController } from '@/lib/controllers/UserController';
import { handleApiResponse } from '@/lib/utils/BaseRoute';
import { NextRequest } from 'next/server';

export const GET = protectRoute(async (request: NextRequest, { user }) => {
  if (!user?.id) {
    throw new Error('Invalid user session');
  }
  
  // Fetch complete user data including roles and permissions
  const [userRoles, userPermissions, isSuperAdmin, currentUser] = await Promise.all([
    userController.getUserRoles(user.id),
    userController.getUserPermissions(user.id),
    userController.isSuperAdmin(user.id),
    userController.getCurrentUser(user.id)
  ]);

  if (!currentUser.success) {
    return handleApiResponse(currentUser, user.email);
  }

  const result = {
    success: true,
    data: {
      ...currentUser.data,
      roles: userRoles,
      permissions: userPermissions,
      isSuperAdmin
    },
    message: 'User profile retrieved successfully'
  };

  return handleApiResponse(result, user.email);
});

export const PUT = protectRoute(async (request: NextRequest, { user }) => {
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
});

export const DELETE = protectRoute(async (request: NextRequest, { user }) => {
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
});
