// Test authentication manually
import { authenticateUser } from './src/lib/services/authService.js';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test with some sample credentials
    const result = await authenticateUser('admin@example.com', 'admin123');
    console.log('Auth result:', result);
    
    if (!result) {
      console.log('Authentication failed - checking if user exists...');
      // You can add more specific debugging here
    }
    
  } catch (error) {
    console.error('Authentication test error:', error);
  }
}

testAuth();
