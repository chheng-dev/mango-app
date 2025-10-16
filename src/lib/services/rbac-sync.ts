import { db } from '../db';
import { permissions } from '../db/schemas/permissions';
import { roles } from '../db/schemas/roles';
import { rolePermissions } from '../db/schemas/role_permission';
import { PERMISSIONS } from '../constants/permissions';
import { eq, and } from 'drizzle-orm';

/**
 * Default roles configuration
 * These will be created if they don't exist
 */
const DEFAULT_ROLES = [
  {
    slug: 'super-admin',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    isActive: true,
  },
  {
    slug: 'admin',
    name: 'Admin',
    description: 'Administrative access to most features',
    isActive: true,
  },
  {
    slug: 'user',
    name: 'User',
    description: 'Standard user with basic permissions',
    isActive: true,
  },
];

/**
 * Default role-permission mappings
 * Note: super-admin automatically gets all permissions
 */
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'admin': [
    'user_read',
    'user_create',
    'user_update',
    'user_export',
    'roles_read',
    'roles_create',
    'roles_update',
    'roles_export',
    'permissions_read',
    'permissions_export',
    'profiles_read',
    'profiles_update',
    'contact_person_read',
    'contact_person_create',
    'contact_person_update',
    'contact_person_export',
  ],
  'user': [
    'profiles_read',
    'profiles_update',
    'contact_person_read',
  ],
};

/**
 * Sync permissions and roles from constants to database
 * For a fully dynamic system, this only syncs base permissions from constants
 * Roles and their permissions can be managed through the UI
 */
export async function syncPermissionsAndRolesToDB() {
  try {
    console.log('🔄 Starting permissions and roles sync...');

    // 1. Sync Permissions from constants
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
        // Parse resource and action from slug (e.g., 'user_read' -> resource: 'user', action: 'read')
        const parts = slug.split('_');
        const action = parts.pop() || 'access'; // Last part is action
        const resource = parts.join('_'); // Rest is resource

        // Create new permission
        const [newPermission] = await db
          .insert(permissions)
          .values({
            name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            slug: slug,
            resource: resource,
            action: action,
            description: `Permission to ${action} ${resource}`,
          })
          .returning();
        
        createdPermissions.push(newPermission);
        console.log(`  ✅ Created permission: ${slug}`);
      } else {
        console.log(`  ℹ️  Permission already exists: ${slug}`);
      }
    }

    // 2. Sync Default Roles (if they don't exist)
    console.log('👥 Syncing default roles...');
    const createdRoles = [];

    for (const roleConfig of DEFAULT_ROLES) {
      // Check if role already exists
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.slug, roleConfig.slug))
        .limit(1);

      if (!existingRole) {
        // Create new role
        const [newRole] = await db
          .insert(roles)
          .values(roleConfig)
          .returning();
        
        createdRoles.push(newRole);
        console.log(`  ✅ Created role: ${roleConfig.slug}`);
      } else {
        console.log(`  ℹ️  Role already exists: ${roleConfig.slug}`);
      }
    }

    // 3. Sync Default Role Permissions (only for newly created roles or if explicitly requested)
    console.log('🔗 Syncing default role permissions...');
    
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
            and(
              eq(rolePermissions.roleId, role.id),
              eq(rolePermissions.permissionId, permission.id)
            )
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
 * Remove permissions that are no longer defined in constants
 * Note: In a dynamic system, roles are managed through the UI and should NOT be cleaned up automatically
 */
export async function cleanupOrphanedPermissionsAndRoles() {
  try {
    console.log('🧹 Cleaning up orphaned permissions...');

    // Get all permission slugs from constants
    const definedPermissions = Object.values(PERMISSIONS);
    const definedRoleSlugs = DEFAULT_ROLES.map(r => r.slug);

    // Find permissions in DB that are not in constants
    const allDbPermissions = await db.select().from(permissions);
    const orphanedPermissions = allDbPermissions.filter(
      p => !definedPermissions.includes(p.slug as any)
    );

    // Delete orphaned permissions
    let deletedCount = 0;
    for (const permission of orphanedPermissions) {
      await db
        .delete(permissions)
        .where(eq(permissions.id, permission.id));
      
      console.log(`  🗑️  Deleted orphaned permission: ${permission.slug}`);
      deletedCount++;
    }

    // Optional: Warn about roles that are not in default list
    // (but don't delete them as they may be custom roles created through UI)
    const allDbRoles = await db.select().from(roles);
    const customRoles = allDbRoles.filter(
      r => !definedRoleSlugs.includes(r.slug)
    );

    if (customRoles.length > 0) {
      console.log(`  ℹ️  Found ${customRoles.length} custom roles (not cleaning up):`);
      customRoles.forEach(role => {
        console.log(`     - ${role.slug}: ${role.name}`);
      });
    }

    console.log('✨ Cleanup completed successfully!');
    
    return {
      success: true,
      cleaned: {
        permissions: deletedCount,
        customRolesFound: customRoles.length,
      }
    };

  } catch (error) {
    console.error('❌ Error cleaning up orphaned data:', error);
    throw error;
  }
}
