#!/usr/bin/env tsx

/**
 * Assign admin role to specific user by email
 */

import { userController } from '@/lib/controllers/UserController';
import { db } from '../src/lib/db';
import { roles } from '../src/lib/db/schemas/roles';
import { userRoles } from '../src/lib/db/schemas/user_roles';
import { users } from '../src/lib/db/schemas/users';
import { eq, and } from 'drizzle-orm';

async function assignAdminRole(userEmail: string) {
  try {
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, userEmail));
    
    if (user.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ Found user: ${user[0].email} (ID: ${user[0].id})`);
    
    // Find admin role
    const adminRole = await db.select().from(roles).where(eq(roles.slug, 'admin'));
    
    if (adminRole.length === 0) {
      console.log('❌ Admin role not found');
      return;
    }
    
    console.log(`✅ Found admin role: ${adminRole[0].name} (ID: ${adminRole[0].id})`);
    
    // Check if user already has admin role
    const existing = await db.select()
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, user[0].id),
        eq(userRoles.roleId, adminRole[0].id)
      ));
    
    if (existing.length > 0) {
      console.log('⏭️  User already has admin role');
      return;
    }
    
    // Assign admin role
    await db.insert(userRoles).values({
      userId: user[0].id,
      roleId: adminRole[0].id,
      isActive: true,
      expiresAt: null
    });
    
    console.log('✅ Successfully assigned admin role to user');
    
    // Test permissions
    const permissions = await userController.getUserPermissions(user[0].id);
    console.log(`🔐 User now has ${permissions.length} permissions:`, permissions);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line or use default
const userEmail = process.argv[2] || 'chheng@gmail.com';
assignAdminRole(userEmail).then(() => process.exit(0));
