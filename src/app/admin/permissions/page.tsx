'use client';

import { DataTable } from '@/components/ui/data-table';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import { usePermissionsTableConfig } from '@/components/admin/permissions/PermissionsTableConfig';
import { HeaderComp } from '@/components/share/header-comp';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Permission } from '@/lib/types/permission';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/constants/permissions';

export default function PermissionsPage() {
  const router = useRouter();
  const { hasPermission } = useUserPermissions();

  const {
    permissions,
    loading: permissionsLoading,
    deletePermission,
    fetchPermissions
  } = usePermissions();

  const { columns } = usePermissionsTableConfig();

  const allBulkActions = [
    {
      label: 'Activate',
      icon: CheckCircle,
      variant: 'success' as const,
      requiredPermission: [PERMISSIONS.PERMISSIONS_UPDATE],
      onClick: async (selectedPermissions: typeof permissions) => {
        try {
          // Add your activation logic here
          toast.success(`${selectedPermissions.length} permissions activated successfully`);
        } catch (error) {
          console.error('Failed to activate permissions:', error);
          toast.error('Failed to activate permissions');
        }
      }
    },
    {
      label: 'Deactivate',
      icon: XCircle,
      variant: 'warning' as const,
      requiredPermission: [PERMISSIONS.PERMISSIONS_UPDATE],
      onClick: async (selectedPermissions: typeof permissions) => {
        try {
          toast.success(`${selectedPermissions.length} permissions deactivated successfully`);
        } catch (error) {
          console.error('Failed to deactivate permissions:', error);
          toast.error('Failed to deactivate permissions');
        }
      }
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive' as const,
      requiredPermission: 'permissions_delete',
      requiresConfirmation: true,
      confirmTitle: 'Delete Permission',
      confirmMessage: 'Are you sure you want to delete this permission?',
      confirmButtonText: 'Delete',
      onClick: async (selectedPermissions: typeof permissions) => {
        try {
          await Promise.all(
            selectedPermissions.map(async (permission) => {
              return deletePermission((permission as any).id);
            })
          );
          await fetchPermissions();
          toast.success(`${selectedPermissions.length} permissions deleted successfully`);
        } catch (error) {
          console.error('Failed to delete permissions:', error);
          toast.error('Failed to delete permissions');
        }
      }
    }
  ];

  const bulkActions = {
    actions: allBulkActions.filter(action => 
      hasPermission([action.requiredPermission as any])
    ),
  };

  const handleCreatePermission = useCallback(( ) => {
    router.push('/admin/permissions/create');
  }, [router]);

  const handleEditPermission = useCallback((permission: Permission) => {
    router.push(`/admin/permissions/edit?id=${permission.id}`);
  }, [router]);

  return (
    <div className="space-y-6">
      <HeaderComp
        onAdd={handleCreatePermission}
        btnAdd="Add Permission"
        title="Permission Management"
        description="Manage permissions for roles and users"
        requiresExportPermission={PERMISSIONS.PERMISSIONS_EXPORT}
        requiresCreatePermission={PERMISSIONS.PERMISSIONS_CREATE}
      />
      
      <DataTable
        data={permissions as any}
        columns={columns}
        searchPlaceholder="Search permissions by name, resource, or action..."
        isLoading={permissionsLoading}
        onRowClick={handleEditPermission}
        bulkActions={bulkActions as any}
      />
    </div>
  );
}