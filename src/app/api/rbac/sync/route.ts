import { NextRequest, NextResponse } from 'next/server';
import { syncPermissionsAndRolesToDB, cleanupOrphanedPermissionsAndRoles } from '@/lib/services/rbac-sync';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cleanup = searchParams.get('cleanup') === 'true';

    console.log('🚀 Starting RBAC sync...');
    
    // First sync permissions and roles
    const syncResult = await syncPermissionsAndRolesToDB();
    
    let cleanupResult = null;
    if (cleanup) {
      console.log('🧹 Running cleanup...');
      cleanupResult = await cleanupOrphanedPermissionsAndRoles();
    }

    return NextResponse.json({
      success: true,
      message: 'RBAC sync completed successfully',
      data: {
        sync: syncResult,
        cleanup: cleanupResult,
      }
    });

  } catch (error) {
    console.error('RBAC sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync RBAC data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'RBAC sync endpoint',
      instructions: {
        sync: 'POST /api/rbac/sync - Sync permissions and roles to database',
        cleanup: 'POST /api/rbac/sync?cleanup=true - Sync and cleanup orphaned data',
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get sync info'
    }, { status: 500 });
  }
}
