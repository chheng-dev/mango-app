'use client';

import { DataTable } from '@/components/ui/data-table';
import { CheckCircle, Trash2, XCircle } from 'lucide-react';
import { usePermissionsTableConfig } from '@/components/admin/permissions/PermissionsTableConfig';
import { HeaderComp } from '@/components/share/header-comp';
import { usePermissions } from '@/hooks/usePermissions';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Permission } from '@/lib/types/permission';

export default function PermissionsPage() {
  const router = useRouter();

  const {
    permissions,
    loading: permissionsLoading,
    deletePermission,
    fetchPermissions
  } = usePermissions();

  const { columns } = usePermissionsTableConfig();

  const bulkActions = {
    actions: [
      {
        label: 'Activate',
        icon: CheckCircle,
        variant: 'success' as const,
      },
      {
        label: 'Deactivate',
        icon: XCircle,
        variant: 'warning' as const,
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive' as const,
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
          } catch (error) {
            console.error('Failed to delete permissions:', error);
          }
        }
      }
    ],
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