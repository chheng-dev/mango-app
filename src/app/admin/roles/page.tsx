'use client';

import { DataTable } from '@/components/ui/data-table';
import { useRolesTableConfig } from '@/components/admin/roles/RolesTableConfig';
import { HeaderComp } from '@/components/share/header-comp';
import { Trash2 } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Role } from '@/lib/types/role';

export default function RolesManagementPage() {
  const router = useRouter();

  const {
    roles,
    loading: rolesLoading,
    deleteRole,
  } = useRoles();

  const { columns } = useRolesTableConfig();

  const handleCreateRole = useCallback(() => {
    router.push('/admin/roles/create');
  }, [router]);

  const handleRowClick = (role: any, event?: React.MouseEvent) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
  }

   const handleDeleteRole = useCallback(async (role: Role) => {
      try {
        const result = await deleteRole(role.id);
        if (result.success) {
          toast.success(`Role "${role.name}" has been deleted successfully`);
        } else {
          toast.error(result.error || 'Failed to delete role');
        }
      } catch (error) {
        console.error('Failed to delete role:', error);
        toast.error('Failed to delete role. Please try again.');
      }
    }, [deleteRole]);

      const bulkActions = {
      actions: [
        {
          label: 'Delete',
          icon: Trash2,
          variant: 'destructive' as const,
          requiresConfirmation: true,
          confirmTitle: 'Delete Roles',
          confirmMessage: 'Are you sure you want to delete the selected roles? This action cannot be undone.',
          confirmButtonText: 'Delete',
          onClick: handleDeleteRole,
        },
      ]
    }


  return (
    <div className="space-y-6">
      <HeaderComp
        onAdd={handleCreateRole}
        btnAdd="Add Role"
        title="Role Management"
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
