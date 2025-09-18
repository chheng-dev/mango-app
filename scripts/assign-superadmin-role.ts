import { db } from '../src/lib/db/index.js';
import { users, roles, userRoles } from '../src/lib/db/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Assign Super Admin Role to User
 * Usage: tsx scripts/assign-superadmin-role.ts
 */
async function assignSuperAdminRole() {
  console.log('🦸 Starting Super Admin Role Assignment...');

  try {
    // 1. Find the user
    const user = await db.select().from(users).where(eq(users.email, 'chheng@gmail.com')).limit(1);
    
    if (user.length === 0) {
      console.error('❌ User chheng@gmail.com not found');
      process.exit(1);
    }

    const userId = user[0].id;
    console.log(`👤 Found user: ${user[0].email} (ID: ${userId})`);

    // 2. Find or create super_admin role
    let superAdminRole = await db.select().from(roles).where(eq(roles.name, 'super_admin')).limit(1);
    
    if (superAdminRole.length === 0) {
      console.log('🆕 Creating super_admin role...');
      superAdminRole = await db.insert(roles).values({
        name: 'super_admin',
        slug: 'super-admin',
        description: 'Super Administrator with full system access'
      }).returning();
    }

    const superAdminRoleId = superAdminRole[0].id;
    console.log(`🔑 Super Admin Role ID: ${superAdminRoleId}`);

    // 3. Remove existing role assignments
    console.log('🧹 Removing existing role assignments...');
    await db.delete(userRoles).where(eq(userRoles.userId, userId));

    // 4. Assign super admin role
    console.log('🦸 Assigning Super Admin role...');
    await db.insert(userRoles).values({
      userId: userId,
      roleId: superAdminRoleId
    });

    // 5. Verify assignment
    const assignedRoles = await db
      .select({
        userId: userRoles.userId,
        roleName: roles.name,
        roleId: roles.id
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    console.log('✅ Role assignment completed!');
    console.log('📋 Current roles:', assignedRoles);

    console.log('\n🎉 Super Admin Assignment Summary:');
    console.log(`   User: chheng@gmail.com (ID: ${userId})`);
    console.log(`   Role: super_admin (ID: ${superAdminRoleId})`);
    console.log('   Status: ✅ Active');
    console.log('\n💡 The user now has super admin privileges and can bypass all permission checks.');

  } catch (error) {
    console.error('❌ Error assigning super admin role:', error);
    process.exit(1);
  }
}

// Run the script
assignSuperAdminRole();
