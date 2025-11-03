#!/usr/bin/env tsx

import { syncPermissionsAndRolesToDB, cleanupOrphanedPermissionsAndRoles } from '../src/lib/services/rbac-sync';

async function main() {
  try {
    console.log('🚀 Starting RBAC sync script...');
    
    // Check command line arguments
    const cleanup = process.argv.includes('--cleanup');
    
    // Sync permissions and roles
    const syncResult = await syncPermissionsAndRolesToDB();
    console.log('\n📊 Sync Summary:', syncResult.summary);
    
    // Cleanup if requested
    if (cleanup) {
      console.log('\n🧹 Running cleanup...');
      const cleanupResult = await cleanupOrphanedPermissionsAndRoles();
      console.log('\n📊 Cleanup Summary:', cleanupResult.cleaned);
    }
    
    console.log('\n✅ RBAC sync completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ RBAC sync failed:', error);
    process.exit(1);
  }
}

main();
