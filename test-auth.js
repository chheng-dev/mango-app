// Quick test to check if authentication is working
const { execSync } = require('child_process');

try {
  // Test if the auth API endpoint responds
  console.log('Testing NextAuth endpoints...');
  
  const testSession = execSync('curl -s http://localhost:3000/api/auth/session', { encoding: 'utf8' });
  console.log('Session endpoint:', testSession);
  
  const testProviders = execSync('curl -s http://localhost:3000/api/auth/providers', { encoding: 'utf8' });
  console.log('Providers endpoint:', testProviders);
  
} catch (error) {
  console.error('Error testing auth endpoints:', error.message);
}
