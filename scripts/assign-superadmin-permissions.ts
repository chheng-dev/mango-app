import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { permissions, roles, rolePermissions } from "@/lib/db/schema";
import { config } from 'dotenv';

// Load environment variables
config();

async function assignAllPermissionsToSuperAdmin() {
  try {
    console.log('🔄 Starting Super Admin permission assignment...');

    // Find the Super Admin role
    const superAdminRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.slug, 'super-admin'));

    if (superAdminRoles.length === 0) {
      console.error('❌ Super Admin role not found');
      return;
    }

    const superAdminRole = superAdminRoles[0];
    console.log(`✅ Found Super Admin role: ${superAdminRole.name} (ID: ${superAdminRole.id})`);

    // Get all permissions
    const allPermissions = await db.select().from(permissions);
    console.log(`📊 Found ${allPermissions.length} permissions to assign`);

    // Get existing role-permission assignments for super admin
    const existingAssignments = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, superAdminRole.id));

    const existingPermissionIds = new Set(existingAssignments.map(rp => rp.permissionId));
    console.log(`📊 Super Admin already has ${existingAssignments.length} permissions assigned`);

    // Find permissions that need to be assigned
    const permissionsToAssign = allPermissions.filter(p => !existingPermissionIds.has(p.id));

    if (permissionsToAssign.length === 0) {
      console.log('✅ Super Admin already has all permissions assigned');
      return;
    }

    console.log(`➕ Assigning ${permissionsToAssign.length} new permissions to Super Admin...`);

    // Assign missing permissions to Super Admin
    const assignmentData = permissionsToAssign.map(permission => ({
      roleId: superAdminRole.id,
      permissionId: permission.id
    }));

    await db.insert(rolePermissions).values(assignmentData);

    console.log('🎉 Successfully assigned all permissions to Super Admin!');

    // Show summary
    const finalCount = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, superAdminRole.id));

    console.log(`📊 Super Admin now has ${finalCount.length} total permissions`);

    // List all permissions for verification
    const superAdminWithPermissions = await db
      .select({
        permissionName: permissions.name,
        resource: permissions.resource,
        action: permissions.action
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, superAdminRole.id));

    console.log('📋 Super Admin permissions:');
    superAdminWithPermissions.forEach(p => {
      console.log(`   • ${p.permissionName} (${p.resource}:${p.action})`);
    });

  } catch (error) {
    console.error('❌ Error assigning permissions to Super Admin:', error);
    throw error;
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npm run rbac:assign-superadmin-permissions');
  console.log('');
  console.log('This script assigns all existing permissions to the Super Admin role.');
  console.log('It will:');
  console.log('  - Find the Super Admin role by slug "super-admin"');
  console.log('  - Get all permissions from the permissions table');
  console.log('  - Assign any missing permissions to the Super Admin role');
  console.log('  - Skip permissions already assigned');
  process.exit(0);
}

assignAllPermissionsToSuperAdmin()
  .then(() => {
    console.log('✅ Permission assignment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Permission assignment failed:', error);
    process.exit(1);
  });
