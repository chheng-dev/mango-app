// Create a test user for authentication testing
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    // Use SQL directly since we can't easily import the ES modules
    const { execSync } = require('child_process');
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const sql = `
      INSERT INTO users (email, code, name, password_hash, password_confirmation, is_active, is_verified) 
      VALUES ('admin@test.com', 'TEST001', 'Test Admin', '${hashedPassword}', '${hashedPassword}', true, true)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        password_confirmation = EXCLUDED.password_confirmation;
    `;
    
    execSync(`psql postgresql://user@localhost:5432/mango_app -c "${sql}"`, { 
      stdio: 'inherit' 
    });
    
    console.log('✅ Test user created/updated:');
    console.log('   Email: admin@test.com');
    console.log('   Password: testpassword123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();
