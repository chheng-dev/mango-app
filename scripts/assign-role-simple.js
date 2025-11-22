// Simple script to assign admin role to user ID 23
// Run with: node scripts/assign-role-simple.js

const { Client } = require('pg');

async function assignAdminRole() {
  console.log('🔄 Assigning admin role to user ID 23...');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('📡 Connected to database');

    // First, ensure admin role exists
    console.log('🔍 Checking if admin role exists...');
    const roleResult = await client.query(`
      SELECT id, name, slug FROM roles WHERE slug = 'admin'
    `);

    let roleId;
    if (roleResult.rows.length === 0) {
      console.log('➕ Creating admin role...');
      const createRoleResult = await client.query(`
        INSERT INTO roles (name, slug, description, "isSystemRole")
        VALUES ('Admin', 'admin', 'Administrative access with most permissions', true)
        RETURNING id
      `);
      roleId = createRoleResult.rows[0].id;
      console.log(`✅ Created admin role with ID: ${roleId}`);
    } else {
      roleId = roleResult.rows[0].id;
      console.log(`✅ Admin role exists with ID: ${roleId}`);
    }

    // Check if user exists
    console.log('👤 Checking if user ID 23 exists...');
    const userResult = await client.query(`
      SELECT id, email, name FROM users WHERE id = 23
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ User ID 23 not found');
      return;
    }

    const user = userResult.rows[0];
    console.log(`✅ Found user: ${user.email} (${user.name})`);

    // Check if user already has admin role
    const existingRoleResult = await client.query(`
      SELECT * FROM user_roles
      WHERE user_id = 23 AND role_id = $1 AND is_active = true
    `, [roleId]);

    if (existingRoleResult.rows.length > 0) {
      console.log('⏭️  User already has admin role');
      return;
    }

    // Assign admin role
    console.log('🔗 Assigning admin role to user...');
    await client.query(`
      INSERT INTO user_roles (user_id, role_id, is_active)
      VALUES (23, $1, true)
    `, [roleId]);

    console.log('✅ Successfully assigned admin role to user ID 23');

    // Verify permissions
    console.log('🔐 Verifying permissions...');
    const permissionsResult = await client.query(`
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = 23 AND ur.is_active = true AND p.is_active = true
    `);

    const permissions = permissionsResult.rows.map(row => row.name);
    console.log(`🎯 User now has ${permissions.length} permissions:`, permissions.slice(0, 5), permissions.length > 5 ? '...' : '');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('📪 Database connection closed');
  }
}

assignAdminRole();
