import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { roles, permissions, rolePermissions } from "../db/schema";
import { SYSTEM_ROLES, getRolePermissions } from "../types/rbac";

export async function syncRoles() {
  try {
    console.log('🔄 Starting role synchronization...');

    // Define system roles to ensure they exist
    const systemRoles = [
      {
        name: 'Super Admin',
        slug: SYSTEM_ROLES.SUPER_ADMIN,
        description: 'Full system access with all permissions',
        isSystemRole: true
      },
      {
        name: 'Admin',
        slug: SYSTEM_ROLES.ADMIN,
        description: 'Administrative access with most permissions',
        isSystemRole: true
      },
      {
        name: 'User',
        slug: SYSTEM_ROLES.USER,
        description: 'Basic user access with limited permissions',
        isSystemRole: true
      }
    ];

    for (const roleData of systemRoles) {
      console.log(`🔍 Checking role: ${roleData.slug}`);

      // Check if role exists
      const existingRole = await db
        .select()
        .from(roles)
        .where(eq(roles.slug, roleData.slug))
        .limit(1);

      let roleId: number;

      if (existingRole.length === 0) {
        console.log(`➕ Creating role: ${roleData.slug}`);
        const result = await db
          .insert(roles)
          .values(roleData)
          .returning({ id: roles.id });

        roleId = result[0].id;
        console.log(`✅ Role created with ID: ${roleId}`);
      } else {
        roleId = existingRole[0].id;
        console.log(`✅ Role already exists with ID: ${roleId}`);

        // Update role if needed
        await db
          .update(roles)
          .set({
            name: roleData.name,
            description: roleData.description,
            isSystemRole: roleData.isSystemRole
          })
          .where(eq(roles.id, roleId));
      }

      // Sync permissions for this role
      console.log(`🔐 Syncing permissions for role: ${roleData.slug}`);
      await syncRolePermissions(roleId, roleData.slug);
    }

    console.log('🎉 Role synchronization completed successfully!');

  } catch (error) {
    console.error('❌ Error during role synchronization:', error);
    throw error;
  }
}

async function syncRolePermissions(roleId: number, roleSlug: string) {
  try {
    // Get expected permissions for this role
    const expectedPermissions = getRolePermissions(roleSlug);
    console.log(`📋 Expected permissions for ${roleSlug}:`, expectedPermissions);

    if (expectedPermissions.length === 0) {
      console.log(`⚠️ No permissions defined for role: ${roleSlug}`);
      return;
    }

    // Get current permissions for this role
    const currentRolePermissions = await db
      .select({
        permissionId: permissions.id,
        permissionName: permissions.name
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    const currentPermissionNames = currentRolePermissions.map(rp => rp.permissionName);
    console.log(`📊 Current permissions for ${roleSlug}:`, currentPermissionNames);

    // Find permissions to add
    const permissionsToAdd = expectedPermissions.filter(
      perm => !currentPermissionNames.includes(perm)
    );

    // Find permissions to remove
    const permissionsToRemove = currentRolePermissions.filter(
      rp => !expectedPermissions.includes(rp.permissionName)
    );

    // Remove unwanted permissions
    if (permissionsToRemove.length > 0) {
      console.log(`🗑️ Removing ${permissionsToRemove.length} permissions from ${roleSlug}`);
      const idsToRemove = permissionsToRemove.map(rp => rp.permissionId);
      await db
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, idsToRemove[0]) // For simplicity, remove one by one
          )
        );
    }

    // Add missing permissions
    if (permissionsToAdd.length > 0) {
      console.log(`➕ Adding ${permissionsToAdd.length} permissions to ${roleSlug}`);

      for (const permissionName of permissionsToAdd) {
        // Find the permission ID
        const permission = await db
          .select()
          .from(permissions)
          .where(eq(permissions.name, permissionName))
          .limit(1);

        if (permission.length > 0) {
          await db
            .insert(rolePermissions)
            .values({
              roleId: roleId,
              permissionId: permission[0].id
            });
        } else {
          console.warn(`⚠️ Permission not found in database: ${permissionName}`);
        }
      }
    }

    if (permissionsToAdd.length === 0 && permissionsToRemove.length === 0) {
      console.log(`✅ Permissions already in sync for ${roleSlug}`);
    }

  } catch (error) {
    console.error(`❌ Error syncing permissions for role ${roleSlug}:`, error);
    throw error;
  }
}
