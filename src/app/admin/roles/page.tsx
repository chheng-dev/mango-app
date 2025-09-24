'use client';

import { DataTable } from '@/components/ui/data-table';
import { Shield } from 'lucide-react';
import { useRolesPage } from '@/hooks/useRolesPage';
import { useRolesTableConfig } from '@/components/admin/roles/RolesTableConfig';
import { HeaderComp } from '@/components/share/header-comp';

export default function RolesManagementPage() {
  const {
    roles,
    loading,
    handleCreateRole,
    handleEditRole,
    handleViewRole,
    handleDeleteRole,
    handleAssignUsers,
    handleManagePermissions,
    deleteLoading
  } = useRolesPage();

  const { columns, rowActions } = useRolesTableConfig({
    onViewRole: handleViewRole,
    onEditRole: handleEditRole,
    onDeleteRole: handleDeleteRole,
    onAssignUsers: handleAssignUsers,
    onManagePermissions: handleManagePermissions,
    deleteLoading
  });
  

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
        columns={columns}
        searchPlaceholder="Search roles by name, slug, or description..."
        rowActions={rowActions}
        onAdd={handleCreateRole}
        addButtonText="Add Role"
        isLoading={loading}
        skeletonRows={6}
        emptyTitle="No roles found"
        emptyDescription="Start by creating your first role to manage permissions and user access."
        emptyIcon={Shield}
      />
    </div>
  );
}
