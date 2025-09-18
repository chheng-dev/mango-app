import { db } from '../db';
import { permissions } from '../db/schemas/permissions';
import { roles } from '../db/schemas/roles';
import { rolePermissions } from '../db/schemas/role_permission';
import { PERMISSIONS, ROLES, DEFAULT_ROLE_PERMISSIONS } from '../constants/permissions';
import { eq, and } from 'drizzle-orm';

/**
 * Sync permissions and roles from constants to database
 */
export async function syncPermissionsAndRolesToDB() {
  try {
    console.log('🔄 Starting permissions and roles sync...');

    // 1. Sync Permissions
    console.log('📋 Syncing permissions...');
    const permissionEntries = Object.entries(PERMISSIONS);
    const createdPermissions = [];

    for (const [key, slug] of permissionEntries) {
      // Check if permission already exists
      const [existingPermission] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.slug, slug))
        .limit(1);

      if (!existingPermission) {
        // Create new permission
        const [newPermission] = await db
          .insert(permissions)
          .values({
            name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            slug: slug,
            resource: slug.split(':')[0],
            action: slug.split(':')[1] || 'access',
            description: `Permission to ${slug.replace(':', ' ')}`,
          })
          .returning();
        
        createdPermissions.push(newPermission);
        console.log(`  ✅ Created permission: ${slug}`);
      } else {
        console.log(`  ℹ️  Permission already exists: ${slug}`);
      }
    }

    // 2. Sync Roles
    console.log('👥 Syncing roles...');
    const roleEntries = Object.entries(ROLES);
    const createdRoles = [];

    for (const [key, slug] of roleEntries) {
      // Check if role already exists
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.slug, slug))
        .limit(1);

      if (!existingRole) {
        // Create new role
        const [newRole] = await db
          .insert(roles)
          .values({
            name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            slug: slug,
            description: `${key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} role`,
            isActive: true,
          })
          .returning();
        
        createdRoles.push(newRole);
        console.log(`  ✅ Created role: ${slug}`);
      } else {
        console.log(`  ℹ️  Role already exists: ${slug}`);
      }
    }

    // 3. Sync Role Permissions
    console.log('🔗 Syncing role permissions...');
    
    for (const [roleSlug, permissionSlugs] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      // Get the role
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.slug, roleSlug))
        .limit(1);

      if (!role) {
        console.log(`  ⚠️  Role not found: ${roleSlug}`);
        continue;
      }

      console.log(`  🔍 Processing role: ${roleSlug}`);

      // Get all permissions for this role
      for (const permissionSlug of permissionSlugs) {
        const [permission] = await db
          .select()
          .from(permissions)
          .where(eq(permissions.slug, permissionSlug))
          .limit(1);

        if (!permission) {
          console.log(`    ⚠️  Permission not found: ${permissionSlug}`);
          continue;
        }

        // Check if role-permission relationship already exists
        const [existingRolePermission] = await db
          .select()
          .from(rolePermissions)
          .where(
            eq(rolePermissions.roleId, role.id) && 
            eq(rolePermissions.permissionId, permission.id)
          )
          .limit(1);

        if (!existingRolePermission) {
          // Create role-permission relationship
          await db
            .insert(rolePermissions)
            .values({
              roleId: role.id,
              permissionId: permission.id,
            });
          
          console.log(`    ✅ Linked ${roleSlug} -> ${permissionSlug}`);
        } else {
          console.log(`    ℹ️  Link already exists: ${roleSlug} -> ${permissionSlug}`);
        }
      }
    }

    console.log('✨ Permissions and roles sync completed successfully!');
    
    // Return summary
    const totalPermissions = await db.select().from(permissions);
    const totalRoles = await db.select().from(roles);
    const totalRolePermissions = await db.select().from(rolePermissions);

    return {
      success: true,
      summary: {
        permissions: totalPermissions.length,
        roles: totalRoles.length,
        rolePermissions: totalRolePermissions.length,
      }
    };

  } catch (error) {
    console.error('❌ Error syncing permissions and roles:', error);
    throw error;
  }
}

/**
 * Remove permissions and roles that are no longer defined in constants
 */
export async function cleanupOrphanedPermissionsAndRoles() {
  try {
    console.log('🧹 Cleaning up orphaned permissions and roles...');

    // Get all permission slugs from constants
    const definedPermissions = Object.values(PERMISSIONS);
    const definedRoles = Object.values(ROLES);

    // Find permissions in DB that are not in constants
    const allDbPermissions = await db.select().from(permissions);
    const orphanedPermissions = allDbPermissions.filter(
      p => !definedPermissions.includes(p.slug as any)
    );

    // Find roles in DB that are not in constants
    const allDbRoles = await db.select().from(roles);
    const orphanedRoles = allDbRoles.filter(
      r => !definedRoles.includes(r.slug as any)
    );

    // Delete orphaned permissions (permissions don't have isActive field)
    for (const permission of orphanedPermissions) {
      await db
        .delete(permissions)
        .where(eq(permissions.id, permission.id));
      
      console.log(`  �️  Deleted orphaned permission: ${permission.slug}`);
    }

    // Deactivate orphaned roles
    for (const role of orphanedRoles) {
      await db
        .update(roles)
        .set({ isActive: false })
        .where(eq(roles.id, role.id));
      
      console.log(`  🚫 Deactivated orphaned role: ${role.slug}`);
    }

    console.log('✨ Cleanup completed successfully!');
    
    return {
      success: true,
      deactivated: {
        permissions: orphanedPermissions.length,
        roles: orphanedRoles.length,
      }
    };

  } catch (error) {
    console.error('❌ Error cleaning up orphaned data:', error);
    throw error;
  }
}
