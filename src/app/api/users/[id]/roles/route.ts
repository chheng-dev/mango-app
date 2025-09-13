import { NextRequest, NextResponse } from 'next/server';
import { roleController } from '@/lib/controllers/RoleController';

/**
 * User Roles API Routes
 * POST /api/users/[id]/roles - Assign role to user
 * DELETE /api/users/[id]/roles - Remove role from user
 * GET /api/users/[id]/roles - Get user roles
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

    const { roleId, assignedBy } = await request.json();
    
    if (!roleId || !assignedBy) {
      return NextResponse.json({ 
        success: false, 
        error: 'roleId and assignedBy are required' 
      }, { status: 400 });
    }

    const result = await roleController.assignRole(userId, roleId, assignedBy);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST assign role error:', error);
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

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    
    if (!roleId) {
      return NextResponse.json({ 
        success: false, 
        error: 'roleId is required as query parameter' 
      }, { status: 400 });
    }

    const result = await roleController.removeRole(userId, parseInt(roleId));
    return NextResponse.json(result);
  } catch (error) {
    console.error('DELETE remove role error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = parseInt(params.id);
//     const body = await request.json();
//     const { roleId, assignedBy } = body;

//     if (!roleId || !assignedBy) {
//       return NextResponse.json(
//         { success: false, error: 'roleId and assignedBy are required' },
//         { status: 400 }
//       );
//     }

//     const result = await userController.assignRole(userId, roleId, assignedBy);

//     return NextResponse.json(result, {
//       status: result.success ? 200 : 400
//     });
//   } catch (error) {
//     console.error('Assign role API error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const userId = parseInt(params.id);
//     const { searchParams } = new URL(request.url);
//     const roleId = searchParams.get('roleId');

//     if (!roleId) {
//       return NextResponse.json(
//         { success: false, error: 'roleId query parameter is required' },
//         { status: 400 }
//       );
//     }

//     const result = await userController.removeRole(userId, parseInt(roleId));

//     return NextResponse.json(result, {
//       status: result.success ? 200 : 400
//     });
//   } catch (error) {
//     console.error('Remove role API error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
