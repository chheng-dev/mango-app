#!/usr/bin/env tsx

/**
 * Complete RBAC Setup Script
 * This script will create all necessary permissions, roles, and assign them properly
 */

import { db } from '../src/lib/db';
import { permissions } from '../src/lib/db/schemas/permissions';
import { roles } from '../src/lib/db/schemas/roles';
import { rolePermissions } from '../src/lib/db/schemas/role_permission';
import { userRoles } from '../src/lib/db/schemas/user_roles';
import { users } from '../src/lib/db/schemas/users';
import { eq, and } from 'drizzle-orm';

// Complete permissions list matching the application needs
const allPermissions = [
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
  
  // Business Features
  { name: 'Read Products', slug: 'product:read', resource: 'product', action: 'read', description: 'View products' },
  { name: 'Create Products', slug: 'product:create', resource: 'product', action: 'create', description: 'Create products' },
  { name: 'Update Products', slug: 'product:update', resource: 'product', action: 'update', description: 'Update products' },
  { name: 'Delete Products', slug: 'product:delete', resource: 'product', action: 'delete', description: 'Delete products' },
  
  // Reports
  { name: 'Read Reports', slug: 'report:read', resource: 'report', action: 'read', description: 'View reports' },
  { name: 'Generate Reports', slug: 'report:generate', resource: 'report', action: 'generate', description: 'Generate reports' },
  
  // Events
  { name: 'Read Events', slug: 'event:read', resource: 'event', action: 'read', description: 'View events' },
  { name: 'Create Events', slug: 'event:create', resource: 'event', action: 'create', description: 'Create events' },
  { name: 'Update Events', slug: 'event:update', resource: 'event', action: 'update', description: 'Update events' },
  { name: 'Delete Events', slug: 'event:delete', resource: 'event', action: 'delete', description: 'Delete events' },
  
  // Calendar & Schedule
  { name: 'Read Calendar', slug: 'calendar:read', resource: 'calendar', action: 'read', description: 'View calendar' },
  { name: 'Update Calendar', slug: 'calendar:update', resource: 'calendar', action: 'update', description: 'Update calendar' },
  { name: 'Read Schedule', slug: 'schedule:read', resource: 'schedule', action: 'read', description: 'View schedule' },
  { name: 'Update Schedule', slug: 'schedule:update', resource: 'schedule', action: 'update', description: 'Update schedule' },
  
  // People
  { name: 'Read People', slug: 'people:read', resource: 'people', action: 'read', description: 'View people' },
  { name: 'Create People', slug: 'people:create', resource: 'people', action: 'create', description: 'Create people records' },
  { name: 'Update People', slug: 'people:update', resource: 'people', action: 'update', description: 'Update people records' },
  { name: 'Delete People', slug: 'people:delete', resource: 'people', action: 'delete', description: 'Delete people records' },
  
  // Notifications
  { name: 'Read Notifications', slug: 'notification:read', resource: 'notification', action: 'read', description: 'View notifications' },
  { name: 'Create Notifications', slug: 'notification:create', resource: 'notification', action: 'create', description: 'Create notifications' },
  { name: 'Update Notifications', slug: 'notification:update', resource: 'notification', action: 'update', description: 'Update notifications' },
  { name: 'Delete Notifications', slug: 'notification:delete', resource: 'notification', action: 'delete', description: 'Delete notifications' },
  
  // Documents
  { name: 'Read Documents', slug: 'document:read', resource: 'document', action: 'read', description: 'View documents' },
  { name: 'Create Documents', slug: 'document:create', resource: 'document', action: 'create', description: 'Create documents' },
  { name: 'Update Documents', slug: 'document:update', resource: 'document', action: 'update', description: 'Update documents' },
  { name: 'Delete Documents', slug: 'document:delete', resource: 'document', action: 'delete', description: 'Delete documents' },
];

// Complete roles with proper hierarchy
const allRoles = [
  { name: 'Super Admin', slug: 'super-admin', description: 'Full system access with all permissions', isActive: true },
  { name: 'Admin', slug: 'admin', description: 'Administrative access with most permissions', isActive: true },
  { name: 'Manager', slug: 'manager', description: 'Management access with limited permissions', isActive: true },
  { name: 'Editor', slug: 'editor', description: 'Content editing permissions', isActive: true },
  { name: 'User', slug: 'user', description: 'Basic user access with minimal permissions', isActive: true },
];

// Role permission mappings
const rolePermissionMappings = {
  'super-admin': 'ALL', // Gets all permissions
  'admin': [
    // User management
    'user:read', 'user:create', 'user:update', 'user:delete',
    // Role management
    'role:read', 'role:create', 'role:update', 'role:delete',
    // Permission management
    'permission:read', 'permission:create', 'permission:update', 'permission:delete',
    // System (but not full admin)
    'system:settings',
    // Profile
    'profile:read', 'profile:update',
    // Business
    'product:read', 'product:create', 'product:update', 'product:delete',
    'report:read', 'report:generate',
    // Events
    'event:read', 'event:create', 'event:update', 'event:delete',
    'calendar:read', 'calendar:update', 'schedule:read', 'schedule:update',
    // People
    'people:read', 'people:create', 'people:update', 'people:delete',
    // Notifications & Documents
    'notification:read', 'notification:create', 'notification:update', 'notification:delete',
    'document:read', 'document:create', 'document:update', 'document:delete',
  ],
  'manager': [
    // User management (read only)
    'user:read',
    // Role management (read only)
    'role:read',
    // Permission management (read only)
    'permission:read',
    // Profile
    'profile:read', 'profile:update',
    // Business (limited)
    'product:read', 'product:update',
    'report:read',
    // Events (limited)
    'event:read', 'event:update',
    'calendar:read', 'schedule:read', 'schedule:update',
    // People (limited)
    'people:read', 'people:update',
    // Notifications & Documents (limited)
    'notification:read', 'document:read',
  ],
  'editor': [
    // Profile
    'profile:read', 'profile:update',
    // Business content
    'product:read', 'product:create', 'product:update',
    // Events content
    'event:read', 'event:create', 'event:update',
    'calendar:read', 'schedule:read',
    // Documents
    'document:read', 'document:create', 'document:update',
  ],
  'user': [
    // Basic profile access
    'profile:read', 'profile:update',
    // Basic read access
    'product:read', 'event:read', 'calendar:read', 'schedule:read',
    'notification:read', 'document:read',
  ],
};

async function createPermissions() {
  console.log('🔐 Creating permissions...');
  const createdPermissions = [];
  
  for (const perm of allPermissions) {
    try {
      // Check if permission exists
      const existing = await db.select().from(permissions).where(eq(permissions.slug, perm.slug));
      
      if (existing.length === 0) {
        const [created] = await db.insert(permissions).values(perm).returning();
        createdPermissions.push(created);
        console.log(`  ✅ Created: ${perm.slug}`);
      } else {
        createdPermissions.push(existing[0]);
        console.log(`  ⏭️  Exists: ${perm.slug}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating ${perm.slug}:`, error.message);
    }
  }
  
  return createdPermissions;
}

async function createRoles() {
  console.log('🛡️  Creating roles...');
  const createdRoles = [];
  
  for (const role of allRoles) {
    try {
      // Check if role exists
      const existing = await db.select().from(roles).where(eq(roles.slug, role.slug));
      
      if (existing.length === 0) {
        const [created] = await db.insert(roles).values(role).returning();
        createdRoles.push(created);
        console.log(`  ✅ Created: ${role.slug}`);
      } else {
        createdRoles.push(existing[0]);
        console.log(`  ⏭️  Exists: ${role.slug}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating ${role.slug}:`, error.message);
    }
  }
  
  return createdRoles;
}

async function assignPermissionsToRoles(allPerms: any[], allRoles: any[]) {
  console.log('🔗 Assigning permissions to roles...');
  
  const permissionMap = Object.fromEntries(allPerms.map(p => [p.slug, p.id]));
  const roleMap = Object.fromEntries(allRoles.map(r => [r.slug, r.id]));
  
  for (const [roleSlug, permissionSlugs] of Object.entries(rolePermissionMappings)) {
    const roleId = roleMap[roleSlug];
    if (!roleId) continue;
    
    console.log(`  🔗 Assigning permissions to ${roleSlug}...`);
    
    // Handle "ALL" permissions for super-admin
    const permsToAssign = permissionSlugs === 'ALL' ? allPerms.map(p => p.slug) : permissionSlugs as string[];
    
    for (const permSlug of permsToAssign) {
      const permId = permissionMap[permSlug];
      if (!permId) continue;
      
      try {
        // Check if assignment exists
        const existing = await db.select()
          .from(rolePermissions)
          .where(and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permId)
          ));
        
        if (existing.length === 0) {
          await db.insert(rolePermissions).values({
            roleId,
            permissionId: permId
          });
        }
      } catch (error: any) {
        console.error(`    ❌ Error assigning ${permSlug} to ${roleSlug}:`, error.message);
      }
    }
    
    console.log(`  ✅ Assigned ${permsToAssign.length} permissions to ${roleSlug}`);
  }
}

async function assignRolesToUsers() {
  console.log('👤 Assigning roles to users...');
  
  try {
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`  Found ${allUsers.length} users`);
    
    // Get admin role
    const adminRole = await db.select().from(roles).where(eq(roles.slug, 'admin'));
    if (adminRole.length === 0) {
      console.log('  ❌ Admin role not found');
      return;
    }
    
    for (const user of allUsers) {
      try {
        // Check if user already has a role
        const existingRoles = await db.select()
          .from(userRoles)
          .where(eq(userRoles.userId, user.id));
        
        if (existingRoles.length === 0) {
          // Assign admin role to all users (you can modify this logic)
          await db.insert(userRoles).values({
            userId: user.id,
            roleId: adminRole[0].id,
            isActive: true,
            expiresAt: null
          });
          console.log(`  ✅ Assigned admin role to ${user.email}`);
        } else {
          console.log(`  ⏭️  ${user.email} already has role(s)`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error assigning role to ${user.email}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error('❌ Error in assignRolesToUsers:', error.message);
  }
}

async function testUserPermissions() {
  console.log('🧪 Testing user permissions...');
  
  try {
    const allUsers = await db.select().from(users).limit(3);
    
    for (const user of allUsers) {
      const { getUserPermissions } = await import('../src/lib/services/rbac-service');
      const permissions = await getUserPermissions(user.id);
      console.log(`  👤 ${user.email}: ${permissions.length} permissions`);
      if (permissions.length > 0) {
        console.log(`    First 5: ${permissions.slice(0, 5).join(', ')}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Error testing permissions:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Complete RBAC Setup...\n');
    
    // Step 1: Create all permissions
    const allPerms = await createPermissions();
    console.log(`✅ Total permissions: ${allPerms.length}\n`);
    
    // Step 2: Create all roles
    const allRoles = await createRoles();
    console.log(`✅ Total roles: ${allRoles.length}\n`);
    
    // Step 3: Assign permissions to roles
    await assignPermissionsToRoles(allPerms, allRoles);
    console.log('✅ Role-permission assignments completed\n');
    
    // Step 4: Assign roles to users
    await assignRolesToUsers();
    console.log('✅ User-role assignments completed\n');
    
    // Step 5: Test permissions
    await testUserPermissions();
    
    console.log('\n🎉 Complete RBAC Setup finished successfully!');
    console.log('   Users should now have proper permissions assigned.');
    console.log('   Refresh your application to see the navigation items.');
    
  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

// Run the setup
main();
