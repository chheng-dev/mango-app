import { NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { BaseRoute, handleApiResponse } from '@/lib/utils/BaseRoute';
import { protectRoute } from '@/lib/auth/nextauth-unified';

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

  // Allow users to view their own roles without special permissions
  if (userId !== user.id) {
    // For viewing other users' roles, require user:read permission
    const userPermissions = await userController.getUserPermissions(user.id);
    const hasPermission = userPermissions.includes('user:read') ||
                          userPermissions.includes('user:manage');
    if (!hasPermission) {
      return BaseRoute.errorResponse('Insufficient permissions', 403);
    }
  }

  try {
    const userWithRoles = await userController.getWithRoles(userId);
    if (!userWithRoles.success) {
      return handleApiResponse(userWithRoles, user?.email);
    }

    // Return only roles data for this endpoint
    const result = {
      success: true,
      data: userWithRoles.data?.roles || [],
      message: 'User roles retrieved successfully'
    };

  return handleApiResponse(result, user?.email);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return BaseRoute.errorResponse('Failed to fetch user roles', 500);
  }
});


export const POST = protectRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');

  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  // Check permissions for assigning roles to users
  const userPermissions = await userController.getUserPermissions(user.id);
  const hasPermission = userPermissions.includes('user:update') ||
                        userPermissions.includes('user:manage') ||
                        userPermissions.includes('role:update') ||
                        userPermissions.includes('role:manage');
  if (!hasPermission) {
    return BaseRoute.errorResponse('Insufficient permissions to assign roles', 403);
  }

  try {
  const body = await request.json();
    const { roleIds } = body;

    if (!Array.isArray(roleIds)) {
      return BaseRoute.errorResponse('roleIds must be an array of numbers', 400);
    }

    if (!roleIds.every(id => typeof id === 'number' && id > 0)) {
      return BaseRoute.errorResponse('All roleIds must be positive numbers', 400);
    }

    // Get current user data to update roles
    const currentUserResult = await userController.getById(userId);
    if (!currentUserResult.success) {
      return handleApiResponse(currentUserResult, user?.email);
    }

    // Update user roles
    const updateResult = await userController.update(userId, { roles: roleIds });
    if (!updateResult.success) {
      return handleApiResponse(updateResult, user?.email);
    }

    // Return updated roles
    const updatedRolesResult = await userController.getWithRoles(userId);
    if (!updatedRolesResult.success) {
      return handleApiResponse(updatedRolesResult, user?.email);
    }

    const result = {
      success: true,
      data: updatedRolesResult.data?.roles || [],
      message: 'Roles assigned to user successfully'
    };

    return handleApiResponse(result, user?.email);
  } catch (error) {
    console.error('Error assigning roles to user:', error);
    return BaseRoute.errorResponse('Failed to assign roles to user', 500);
  }
});

export const PUT = protectRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');

  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  // Check permissions for updating user roles
  const userPermissions = await userController.getUserPermissions(user.id);
  const hasPermission = userPermissions.includes('user:update') ||
                        userPermissions.includes('user:manage') ||
                        userPermissions.includes('role:update') ||
                        userPermissions.includes('role:manage');
  if (!hasPermission) {
    return BaseRoute.errorResponse('Insufficient permissions to update roles', 403);
  }

  try {
    const body = await request.json();
    const { roleIds } = body;

    if (!Array.isArray(roleIds)) {
      return BaseRoute.errorResponse('roleIds must be an array of numbers', 400);
    }

    if (!roleIds.every(id => typeof id === 'number' && id > 0)) {
      return BaseRoute.errorResponse('All roleIds must be positive numbers', 400);
    }

    // Get current user data to ensure user exists
    const currentUserResult = await userController.getById(userId);
    if (!currentUserResult.success) {
      return handleApiResponse(currentUserResult, user?.email);
    }

    // Update user roles (this replaces all existing roles)
    const updateResult = await userController.update(userId, { roles: roleIds });
    if (!updateResult.success) {
      return handleApiResponse(updateResult, user?.email);
  }

    // Return updated roles
    const updatedRolesResult = await userController.getWithRoles(userId);
    if (!updatedRolesResult.success) {
      return handleApiResponse(updatedRolesResult, user?.email);
    }

    const result = {
      success: true,
      data: updatedRolesResult.data?.roles || [],
      message: 'User roles updated successfully'
    };

    return handleApiResponse(result, user?.email);
  } catch (error) {
    console.error('Error updating user roles:', error);
    return BaseRoute.errorResponse('Failed to update user roles', 500);
  }
});

export const DELETE = protectRoute(async (request, { user, params }) => {
  const userId = parseInt(params?.id || '0');

  if (isNaN(userId) || userId <= 0) {
    return BaseRoute.errorResponse('Invalid user ID', 400);
  }

  // Check permissions for removing roles from users
  const userPermissions = await userController.getUserPermissions(user.id);
  const hasPermission = userPermissions.includes('user:update') ||
                        userPermissions.includes('user:manage') ||
                        userPermissions.includes('role:update') ||
                        userPermissions.includes('role:manage');
  if (!hasPermission) {
    return BaseRoute.errorResponse('Insufficient permissions to remove roles', 403);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { roleIds } = body;

    // Get current user data to ensure user exists
    const currentUserResult = await userController.getById(userId);
    if (!currentUserResult.success) {
      return handleApiResponse(currentUserResult, user?.email);
    }

    let newRoleIds: number[] = [];

    if (roleIds && Array.isArray(roleIds)) {
      // Remove specific roles - get current roles and filter out the ones to remove
      if (!roleIds.every(id => typeof id === 'number' && id > 0)) {
        return BaseRoute.errorResponse('All roleIds must be positive numbers', 400);
      }

      const currentRolesResult = await userController.getWithRoles(userId);
      if (!currentRolesResult.success) {
        return handleApiResponse(currentRolesResult, user?.email);
      }

      const currentRoleIds = currentRolesResult.data?.roles || [];
      newRoleIds = currentRoleIds.filter(id => !roleIds.includes(id));
    }
    // If no roleIds provided, remove all roles (set empty array)

    // Update user roles
    const updateResult = await userController.update(userId, { roles: newRoleIds });
    if (!updateResult.success) {
      return handleApiResponse(updateResult, user?.email);
    }

    // Return updated roles
    const updatedRolesResult = await userController.getWithRoles(userId);
    if (!updatedRolesResult.success) {
      return handleApiResponse(updatedRolesResult, user?.email);
    }

    const result = {
      success: true,
      data: updatedRolesResult.data?.roles || [],
      message: roleIds ? 'Specified roles removed from user successfully' : 'All roles removed from user successfully'
    };

    return handleApiResponse(result, user?.email);
  } catch (error) {
    console.error('Error removing roles from user:', error);
    return BaseRoute.errorResponse('Failed to remove roles from user', 500);
  }
}, {
  requiredPermissions: ['user:update']
});
