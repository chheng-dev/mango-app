import { db } from './src/lib/db/index.js';
import { users, roles, userRoles } from './src/lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function assignRoleToUser() {
  try {
    // Check user
    const user = await db.select().from(users).where(eq(users.id, 23)).limit(1);

    if (!user.length) {
      console.log('User not found');
      return;
    }

    console.log('User:', user[0].email, user[0].name);

    // Check existing roles
    const existingRoles = await db
      .select({
        roleId: userRoles.roleId,
        roleName: roles.name,
        isActive: userRoles.isActive
      })
      .from(userRoles)
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, 23));

    console.log('Existing user roles:', existingRoles);

    // Get available roles
    const availableRoles = await db.select().from(roles).where(eq(roles.isActive, true));
    console.log('\nAvailable roles:');
    availableRoles.forEach(r => console.log(`  - ${r.id}: ${r.name} (${r.slug})`));

    // Assign admin role if no roles exist
    if (existingRoles.length === 0) {
      const adminRole = availableRoles.find(r => r.slug === 'admin' || r.slug === 'super-admin');

      if (adminRole) {
        await db.insert(userRoles).values({
          userId: 23,
          roleId: adminRole.id,
          isActive: true
        });
        console.log(`\n✅ Assigned role "${adminRole.name}" to user`);
      } else {
        console.log('\n⚠️ No admin role found. Please create a role first.');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

assignRoleToUser();
