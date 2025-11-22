import { db } from "@/lib/db/index";
import { inArray, sql } from "drizzle-orm";
import { permissionMap } from "../constants/permissions";
import { permissions, rolePermissions } from "../db/schema";

export async function syncPermissions() {
  try {
    console.log('🔄 Starting permission synchronization...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not found');
    
    const allPermissions = Object.entries(permissionMap).flatMap(
      ([resource, actions]) => actions.map((action) => ({ resource, action }))
    );

    console.log(`📊 Found ${allPermissions.length} permissions in permission map`);

    // Test connection first
    console.log('🧪 Testing database connection...');
    try {
      const testResult = await db.execute('SELECT 1 as test');
      console.log('✅ Database connection successful');
    } catch (connError) {
      console.error('❌ Database connection failed:', connError);
      throw connError;
    }

    // Test if permissions table exists
    console.log('🔍 Checking current database and schema...');
    try {
      const dbInfo = await db.execute('SELECT current_database() as db, current_schema() as schema');
      console.log('📊 Database info:', dbInfo);
      
      const tablesList = await db.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions'");
      console.log('📊 Permissions table in information_schema:', tablesList);
    } catch (infoError) {
      console.error('❌ Database info check failed:', infoError);
    }

    console.log('📊 Fetching existing permissions from database...');
    const existing = await db.select().from(permissions);
    console.log(`📊 Found ${existing.length} existing permissions in database`);
    
    const existingSet = new Set(existing.map((p) => `${p.resource}:${p.action}`));
    const allSet = new Set(
      allPermissions.map((p) => `${p.resource}:${p.action}`)
    );

    // Find permissions to remove
    const toRemove = existing.filter(
      (p) => !allSet.has(`${p.resource}:${p.action}`)
    );

    // Batch remove role_permissions and permissions for removed permissions
    if (toRemove.length > 0) {
      console.log(`🗑️  Removing ${toRemove.length} obsolete permissions...`);
      const ids = toRemove.map((perm) => perm.id);
      await db
        .delete(rolePermissions)
        .where(inArray(rolePermissions.permissionId, ids));
      await db.delete(permissions).where(inArray(permissions.id, ids));
      console.log('✅ Obsolete permissions removed');
    }

    // Insert missing permissions
    const missing = allPermissions.filter(
      (p) => !existingSet.has(`${p.resource}:${p.action}`)
    );

    if (missing.length > 0) {
      console.log(`➕ Adding ${missing.length} new permissions...`);
      await db.insert(permissions).values(
        missing.map((p) => ({
          name: `${p.resource}:${p.action}`,
          resource: p.resource,
          action: p.action,
          description: `${p.action} permission for ${p.resource}`,
        }))
      );
      console.log('✅ New permissions added');
    }

    if (toRemove.length === 0 && missing.length === 0) {
      console.log('✅ Permissions already in sync - no changes needed');
    }

    console.log('🎉 Permission synchronization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during permission synchronization:', error);
    throw error;
  }
}
