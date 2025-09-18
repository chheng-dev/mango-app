import { NextRequest, NextResponse } from 'next/server';
import { roleController } from '@/lib/controllers/RoleController';

/**
 * User Roles API Routes
 * GET /api/users/[id]/roles - Get user roles
 * POST /api/users/[id]/roles - Assign role to user
 * PUT /api/users/[id]/roles - Update user roles and permissions
 * DELETE /api/users/[id]/roles - Remove role from user
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

    const result = await roleController.getUserRoles(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET user roles error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    
    // Handle both single role assignment and bulk role assignment
    if (body.roleId && body.assignedBy) {
      // Single role assignment (legacy format)
      const { roleId, assignedBy } = body;
      const result = await roleController.assignRole(userId, roleId, assignedBy);
      return NextResponse.json(result);
    } else if (body.roleIds && Array.isArray(body.roleIds)) {
      // Bulk role assignment (new format)
      const { roleIds } = body;
      let assigned = 0;
      let skipped = 0;
      
      for (const roleId of roleIds) {
        const result = await roleController.assignRole(userId, roleId, 1); // TODO: Get assignedBy from session
        if (result.success) {
          assigned++;
        } else {
          skipped++;
        }
      }
      
      return NextResponse.json({
        success: true,
        data: { assigned, skipped },
        message: `Assigned ${assigned} roles, skipped ${skipped} already assigned roles`
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Either roleId and assignedBy, or roleIds array is required' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('POST assign role error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(
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

    const { roles, permissions } = await request.json();
    
    if (!Array.isArray(roles) && !Array.isArray(permissions)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Either roles or permissions array is required' 
      }, { status: 400 });
    }

    // Update user roles and permissions in bulk
    const result = await roleController.updateUserRoles(userId, {
      roles: roles || [],
      permissions: permissions || []
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT update user roles error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
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

    // Check if it's a query parameter or body request
    const { searchParams } = new URL(request.url);
    const roleIdParam = searchParams.get('roleId');
    
    if (roleIdParam) {
      // Single role removal via query parameter
      const result = await roleController.removeRole(userId, parseInt(roleIdParam));
      return NextResponse.json(result);
    } else {
      // Bulk role removal via request body
      const body = await request.json();
      const { roleIds } = body;
      
      if (!Array.isArray(roleIds)) {
        return NextResponse.json({ 
          success: false, 
          error: 'roleIds array is required for bulk removal' 
        }, { status: 400 });
      }

      let removed = 0;
      for (const roleId of roleIds) {
        const result = await roleController.removeRole(userId, roleId);
        if (result.success) {
          removed++;
        }
      }
      
      return NextResponse.json({
        success: true,
        data: { removed },
        message: `Removed ${removed} roles from user`
      });
    }
  } catch (error) {
    console.error('DELETE remove role error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
