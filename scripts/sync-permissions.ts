import { permissionMap } from "@/lib/constants/permissions";
import { syncPermissions } from "@/lib/utils/sync-permissions";
import { config } from 'dotenv';

// Load environment variables
config();

async function runSync() {
  try {
    console.log('==> Starting permission synchronization...');
    console.log('==> Environment variables:');
    console.log(`    DATABASE_URL: ${process.env.DATABASE_URL || 'NOT SET'}`);
    
    await syncPermissions();
    
    console.log('==> Permission synchronization completed successfully!');
    console.log('==> Permission Resources:');
    Object.entries(permissionMap).forEach(([resource, actions]) => {
      console.log(`   • ${resource}: ${actions.join(', ')}`);
    });

  } catch (error) {
    console.error('==> Error synchronizing permissions:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: npm run sync:permissions');
  console.log('');
  console.log('This script synchronizes permissions from the permissionMap to the database.');
  console.log('It will:');
  console.log('  - Add any new permissions defined in the permission map');
  console.log('  - Remove any obsolete permissions no longer in the map');
  console.log('  - Clean up role_permissions associations for removed permissions');
  console.log('');
  console.log('Run this script:');
  console.log('  - During deployment');
  console.log('  - After modifying the permission map');
  console.log('  - Before generating a superadmin');
  process.exit(0);
}

runSync();

