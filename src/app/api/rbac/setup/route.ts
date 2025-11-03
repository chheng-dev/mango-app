import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { permissions } from '@/lib/db/schemas/permissions';
import { roles } from '@/lib/db/schemas/roles';
import { rolePermissions } from '@/lib/db/schemas/role_permission';
import { userRoles } from '@/lib/db/schemas/user_roles';
import { users } from '@/lib/db/schemas/users';
import { eq, and } from 'drizzle-orm';
import { userController } from '@/lib/controllers/UserController';

/**
 * RBAC Setup API Endpoint
 * GET /api/rbac/setup?email=user@example.com
 */

// Complete permissions list
const completePermissions = [
  // User Management
  { name: 'Read Users', slug: 'user:read', resource: 'user', action: 'read', description: 'View user information' },
  { name: 'Create Users', slug: 'user:create', resource: 'user', action: 'create', description: 'Create new users' },
  { name: 'Update Users', slug: 'user:update', resource: 'user', action: 'update', description: 'Update user information' },
  { name: 'Delete Users', slug: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },
  
  // Role Management
  { name: 'Read Roles', slug: 'role:read', resource: 'role', action: 'read', description: 'View role information' },
  { name: 'Create Roles', slug: 'role:create', resource: 'role', action: 'create', description: 'Create new roles' },
  { name: 'Update Roles', slug: 'role:update', resource: 'role', action: 'update', description: 'Update role information' },
  { name: 'Delete Roles', slug: 'role:delete', resource: 'role', action: 'delete', description: 'Delete roles' },
  
  // Permission Management
  { name: 'Read Permissions', slug: 'permission:read', resource: 'permission', action: 'read', description: 'View permission information' },
  { name: 'Create Permissions', slug: 'permission:create', resource: 'permission', action: 'create', description: 'Create new permissions' },
  { name: 'Update Permissions', slug: 'permission:update', resource: 'permission', action: 'update', description: 'Update permission information' },
  { name: 'Delete Permissions', slug: 'permission:delete', resource: 'permission', action: 'delete', description: 'Delete permissions' },
  
  // System Management
  { name: 'System Admin', slug: 'system:admin', resource: 'system', action: 'admin', description: 'Full system administration' },
  { name: 'System Settings', slug: 'system:settings', resource: 'system', action: 'settings', description: 'Manage system settings' },
  
  // Profile Management
  { name: 'Read Profile', slug: 'profile:read', resource: 'profile', action: 'read', description: 'View profile information' },
  { name: 'Update Profile', slug: 'profile:update', resource: 'profile', action: 'update', description: 'Update profile information' },
];

const completeRoles = [
  { name: 'Super Admin', slug: 'super-admin', description: 'Full system access', isActive: true },
  { name: 'Admin', slug: 'admin', description: 'Administrative access', isActive: true },
  { name: 'Manager', slug: 'manager', description: 'Management access', isActive: true },
  { name: 'User', slug: 'user', description: 'Basic user access', isActive: true },
];

async function setupCompleteRBAC() {
  const results = {
    permissions: { created: 0, existing: 0 },
    roles: { created: 0, existing: 0 },
    assignments: { created: 0, existing: 0 }
  };

  try {
    console.log('🔐 Setting up permissions...');
    
    // Create permissions
    for (const perm of completePermissions) {
      const existing = await db.select().from(permissions).where(eq(permissions.slug, perm.slug));
      
      if (existing.length === 0) {
        await db.insert(permissions).values(perm);
        results.permissions.created++;
        console.log(`  ✅ Created permission: ${perm.slug}`);
      } else {
        results.permissions.existing++;
        console.log(`  ⏭️  Permission exists: ${perm.slug}`);
      }
    }

    console.log('🛡️  Setting up roles...');
    
    // Create roles
    for (const role of completeRoles) {
      const existing = await db.select().from(roles).where(eq(roles.slug, role.slug));
      
      if (existing.length === 0) {
        await db.insert(roles).values(role);
        results.roles.created++;
        console.log(`  ✅ Created role: ${role.slug}`);
      } else {
        results.roles.existing++;
        console.log(`  ⏭️  Role exists: ${role.slug}`);
      }
    }

    console.log('🔗 Setting up role-permission assignments...');
    
    // Get all permissions and roles for assignments
    const allPermissions = await db.select().from(permissions);
    const allRoles = await db.select().from(roles);
    
    const permissionMap = Object.fromEntries(allPermissions.map(p => [p.slug, p.id]));
    const roleMap = Object.fromEntries(allRoles.map(r => [r.slug, r.id]));
    
    // Admin gets most permissions
    const adminRoleId = roleMap['admin'];
    const adminPermissions = [
      'user:read', 'user:create', 'user:update', 'user:delete',
      'role:read', 'role:create', 'role:update', 'role:delete',
      'permission:read', 'permission:create', 'permission:update', 'permission:delete',
      'system:settings', 'profile:read', 'profile:update'
    ];
    
    if (adminRoleId) {
      for (const permSlug of adminPermissions) {
        const permId = permissionMap[permSlug];
        if (permId) {
          const existing = await db.select()
            .from(rolePermissions)
            .where(and(
              eq(rolePermissions.roleId, adminRoleId),
              eq(rolePermissions.permissionId, permId)
            ));
          
          if (existing.length === 0) {
            await db.insert(rolePermissions).values({
              roleId: adminRoleId,
              permissionId: permId
            });
            results.assignments.created++;
          } else {
            results.assignments.existing++;
          }
        }
      }
      console.log(`  ✅ Assigned ${adminPermissions.length} permissions to admin role`);
    }

    // Super Admin gets all permissions
    const superAdminRoleId = roleMap['super-admin'];
    if (superAdminRoleId) {
      for (const perm of allPermissions) {
        const existing = await db.select()
          .from(rolePermissions)
          .where(and(
            eq(rolePermissions.roleId, superAdminRoleId),
            eq(rolePermissions.permissionId, perm.id)
          ));
        
        if (existing.length === 0) {
          await db.insert(rolePermissions).values({
            roleId: superAdminRoleId,
            permissionId: perm.id
          });
          results.assignments.created++;
        } else {
          results.assignments.existing++;
        }
      }
      console.log(`  ✅ Assigned ${allPermissions.length} permissions to super-admin role`);
    }

    return results;
  } catch (error: any) {
    console.error('❌ Setup error:', error);
    throw error;
  }
}

async function assignAdminRoleToUser(userEmail: string) {
  console.log(`👤 Assigning admin role to ${userEmail}...`);
  
  // Find user
  const user = await db.select().from(users).where(eq(users.email, userEmail));
  if (user.length === 0) {
    throw new Error('User not found');
  }
  
  // Find admin role
  const adminRole = await db.select().from(roles).where(eq(roles.slug, 'admin'));
  if (adminRole.length === 0) {
    throw new Error('Admin role not found');
  }
  
  // Check if assignment exists
  const existing = await db.select()
    .from(userRoles)
    .where(and(
      eq(userRoles.userId, user[0].id),
      eq(userRoles.roleId, adminRole[0].id)
    ));
  
  if (existing.length === 0) {
    await db.insert(userRoles).values({
      userId: user[0].id,
      roleId: adminRole[0].id,
      isActive: true,
      expiresAt: null
    });
    console.log(`  ✅ Assigned admin role to ${userEmail}`);
  } else {
    console.log(`  ⏭️  ${userEmail} already has admin role`);
  }
  
  // Test permissions
  const permissions = await userController.getUserPermissions(user[0].id);

  return {
    userId: user[0].id,
    userEmail: user[0].email,
    roleId: adminRole[0].id,
    permissionsCount: permissions.length,
    permissions: permissions.slice(0, 10) // First 10 permissions for brevity
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email parameter required' 
      }, { status: 400 });
    }

    console.log('🚀 Running complete RBAC setup...');
    const setupResults = await setupCompleteRBAC();
    console.log('✅ RBAC setup completed');
    
    // Assign role to user
    const userResults = await assignAdminRoleToUser(userEmail);
    
    return NextResponse.json({
      success: true,
      message: 'RBAC setup and role assignment completed successfully',
      data: {
        setup: setupResults,
        user: userResults
      }
    });
    
  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
