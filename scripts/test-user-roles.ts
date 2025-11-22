import { userController } from '@/lib/controllers/UserController';
import { config } from 'dotenv';

// Load environment variables
config();

async function testUserRoles() {
  try {
    console.log('Testing user roles for user ID 4...');
    
    const roles = await userController.getUserRoles(4);
    console.log('User roles:', roles);
    console.log('First role:', roles[0]);
    console.log('Type of first role:', typeof roles[0]);
    
  } catch (error) {
    console.error('Error testing user roles:', error);
  }
}

testUserRoles().then(() => process.exit(0));
