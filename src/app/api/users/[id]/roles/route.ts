import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/lib/controllers/UserController';
import { roleController } from '@/lib/controllers/RoleController';

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

    const result = await userController.getUserWithRoles(userId);
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
    if (body.roleId) {
      // Single role assignment (legacy format)
      const { roleId } = body;
      const result = await roleController.assignUsersToRole(roleId, [userId]);
      return NextResponse.json(result);
    } else if (body.roleIds && Array.isArray(body.roleIds)) {
      // Bulk role assignment (new format)
      const { roleIds } = body;
      let assigned = 0;
      let skipped = 0;
      
      for (const roleId of roleIds) {
        const result = await roleController.assignUsersToRole(roleId, [userId]);
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
    // For now, return not implemented - this would require complex logic
    return NextResponse.json({ 
      success: false, 
      error: 'Bulk update not implemented yet' 
    }, { status: 501 });
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
      const result = await roleController.removeUsersFromRole(parseInt(roleIdParam), [userId]);
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
        const result = await roleController.removeUsersFromRole(roleId, [userId]);
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
