import { NextRequest, NextResponse } from 'next/server';
import { getUserPermissions, getUserRoles, isSuperAdmin } from '@/lib/services/rbac-service';

/**
 * User Permissions API Routes
 * GET /api/users/[id]/permissions - Get user permissions
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID' 
      }, { status: 400 });
    }

    // Get user permissions, roles, and super admin status
    const [permissions, roles, userIsSuperAdmin] = await Promise.all([
      getUserPermissions(userId),
      getUserRoles(userId),
      isSuperAdmin(userId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        permissions,
        roles,
        permissionsCount: permissions.length,
        rolesCount: roles.length
      },
      meta: {
        isSuperAdmin: userIsSuperAdmin
      }
    });
  } catch (error) {
    console.error('GET user permissions error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
