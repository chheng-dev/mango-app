'use client';

import { useRolesTableConfig } from '@/components/admin/roles/RolesTableConfig';
import { HeaderComp } from '@/components/share/header-comp';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useRoles } from '@/hooks/useRoles';
import { useRouter } from 'next/navigation';

export default function RolesManagementPage() {
  const router = useRouter();
  const { columns } = useRolesTableConfig();
  const {
    data: roles,
    isLoading: rolesLoading,
  } = useRoles();

  if (!roles) return null;

  return (
    <div className="space-y-6">
      <HeaderComp
        onAdd={() => router.push('/admin/roles/create')}
        btnAdd="Add Role"
        title="Role Management"
        description="Manage roles and their permissions"
      />
      <DataTable
        data={roles as any[]}
        columns={columns}
        searchPlaceholder="Search roles by name, slug, or description..."
        isLoading={rolesLoading}
      />
    </div>
  );
}
