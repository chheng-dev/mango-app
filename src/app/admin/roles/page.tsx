'use client';

import { DataTable } from '@/components/ui/data-table';
import { useRolesTableConfig } from '@/components/admin/roles/RolesTableConfig';
import { HeaderComp } from '@/components/share/header-comp';
import { Trash2 } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { useUserPermissions } from '@/hooks/useUserPermissions';

export default function RolesManagementPage() {
  const router = useRouter();
  const { hasPermission } = useUserPermissions();

  const {
    roles,
    loading: rolesLoading,
    deleteRole,
    fetchRoles
  } = useRoles();

  const { columns } = useRolesTableConfig();

  const handleCreateRole = useCallback(() => {
    router.push('/admin/roles/create');
  }, [router]);

  const handleRowClick = (role: any, event?: React.MouseEvent) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
  }

  const handleDeleteRole = async (selectedRoles: typeof roles) => {
    try {
      await Promise.all(
        selectedRoles.map(async (role) => {
          return deleteRole((role as any).id);
        })
      );
      await fetchRoles();
      toast.success(`${selectedRoles.length} roles deleted successfully`);
    } catch (error) {
      console.error('Failed to delete roles:', error);
      toast.error('Failed to delete roles');
    }
  };

  const allBulkActions = [
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive' as const,
      requiresPermission: [PERMISSIONS.ROLES_DELETE],
      requiresConfirmation: true,
      confirmTitle: 'Delete Roles',
      confirmMessage: 'Are you sure you want to delete the selected roles? This action cannot be undone.',
      confirmButtonText: 'Delete',
      onClick: handleDeleteRole,
    },
  ];

  const bulkActions = {
    actions: allBulkActions.filter(action => {
      return hasPermission([action.requiresPermission as any])
    })
  }


  return (
    <div className="space-y-6">
      <HeaderComp
        onAdd={handleCreateRole}
        btnAdd="Add Role"
        title="Role Management"
        requiresCreatePermission={PERMISSIONS.ROLES_CREATE}
        requiresExportPermission={PERMISSIONS.ROLES_EXPORT}
        description="Manage roles and their permissions"
      />
      <DataTable
        data={roles}
        bulkActions={bulkActions as any}
        onRowClick={handleRowClick}
        columns={columns}
        searchPlaceholder="Search roles by name, slug, or description..."
        isLoading={rolesLoading}
      />
    </div>
  );
}
