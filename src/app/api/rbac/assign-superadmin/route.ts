import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, roles, userRoles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { userController } from '@/lib/controllers/UserController';

/**
 * Assign Super Admin Role API Endpoint
 * POST /api/rbac/assign-superadmin
 */

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'userEmail is required' 
      }, { status: 400 });
    }

    console.log(`🦸 Starting Super Admin assignment for: ${userEmail}`);

    // 1. Find the user
    const user = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `User ${userEmail} not found` 
      }, { status: 404 });
    }

    const userId = user[0].id;
    console.log(`👤 Found user: ${user[0].email} (ID: ${userId})`);

    // 2. Find super admin role
    const superAdminRole = await db.select().from(roles).where(eq(roles.slug, 'super-admin')).limit(1);
    
    if (superAdminRole.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Super admin role not found. Run RBAC setup first.' 
      }, { status: 404 });
    }

    const superAdminRoleId = superAdminRole[0].id;
    console.log(`🔑 Super Admin Role ID: ${superAdminRoleId}`);

    // 3. Remove all existing role assignments for this user
    console.log('🧹 Removing existing role assignments...');
    await db.delete(userRoles).where(eq(userRoles.userId, userId));

    // 4. Assign super admin role
    console.log('🦸 Assigning Super Admin role...');
    await db.insert(userRoles).values({
      userId: userId,
      roleId: superAdminRoleId,
      isActive: true,
      expiresAt: null
    });

    // 5. Verify assignment
    const assignedRoles = await db
      .select({
        userId: userRoles.userId,
        roleName: roles.name,
        roleSlug: roles.slug,
        roleId: roles.id
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    console.log('✅ Super Admin assignment completed!');
    console.log('📋 Current roles:', assignedRoles);

    // 6. Get permissions count for verification
    const permissions = await userController.getUserPermissions(userId);

    return NextResponse.json({
      success: true,
      message: 'Super Admin role assigned successfully',
      data: {
        user: {
          id: userId,
          email: user[0].email,
          name: user[0].name
        },
        role: {
          id: superAdminRoleId,
          name: superAdminRole[0].name,
          slug: superAdminRole[0].slug
        },
        permissions: {
          count: permissions.length,
          isSuperAdmin: true,
          sample: permissions.slice(0, 10) // First 10 permissions
        },
        assignedRoles
      }
    });

  } catch (error: any) {
    console.error('❌ Super Admin assignment error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to assign super admin role'
    }, { status: 500 });
  }
}
