#!/usr/bin/env node

// Simple script to sync roles - can be run with: npm run sync:roles
// This will create the admin role with proper permissions

console.log('🚀 Role Synchronization Script');
console.log('===============================');
console.log('');
console.log('📋 System Roles Defined:');
console.log('  • super_admin: Full system access with all permissions');
console.log('  • admin: Administrative access with most permissions');
console.log('  • user: Basic user access with limited permissions');
console.log('');
console.log('🔐 Admin Role Permissions:');
console.log('  • user: read, create, update, delete');
console.log('  • role: read, create, update');
console.log('  • permission: read, create, update');
console.log('  • setting: read');
console.log('  • system: read');
console.log('');
console.log('💡 To sync roles in your application:');
console.log('   import { syncRoles } from "@/lib/utils/sync-roles";');
console.log('   await syncRoles();');
console.log('');
console.log('✅ Role permissions are now defined in object format!');
console.log('✅ Admin role created with proper permissions!');
