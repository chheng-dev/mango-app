import { NextRequest, NextResponse } from 'next/server';
import { roleController } from '@/lib/controllers/RoleController';

/**
 * Role User Assignment API Routes
 * GET /api/rbac/roles/[id]/assign-users - Get available users for role assignment
 * POST /api/rbac/roles/[id]/assign-users - Assign users to role
 * DELETE /api/rbac/roles/[id]/assign-users - Remove users from role
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    if (isNaN(roleId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role ID' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const includeAssigned = searchParams.get('includeAssigned') === 'true';

    const result = await roleController.getUsersForRoleAssignment(roleId, {
      search,
      includeAssigned
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET role users error:', error);
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
    const roleId = parseInt(id);
    if (isNaN(roleId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User IDs array is required' 
      }, { status: 400 });
    }

    // Validate user IDs
    const validUserIds = userIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
    if (validUserIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid user IDs provided' 
      }, { status: 400 });
    }

    const result = await roleController.assignUsersToRole(roleId, validUserIds);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST assign users to role error:', error);
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
    const roleId = parseInt(id);
    if (isNaN(roleId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User IDs array is required' 
      }, { status: 400 });
    }

    // Validate user IDs
    const validUserIds = userIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
    if (validUserIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid user IDs provided' 
      }, { status: 400 });
    }

    const result = await roleController.removeUsersFromRole(roleId, validUserIds);
    return NextResponse.json(result);
  } catch (error) {
    console.error('DELETE remove users from role error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
