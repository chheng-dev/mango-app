import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { Role } from '@/lib/api/roleApiService';
import { toast } from 'sonner';

export function useRolesPage() {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Use the roles hook for data fetching
  const {
    data: rolesResponse,
    isLoading: loading,
    error,
    refetch: fetchRoles
  } = useRoles();

  const deleteRoleMutation = useDeleteRole();

  const roles = rolesResponse?.data || [];

  useEffect(() => {
    if (error) {
      toast.error('Failed to load roles');
    }
  }, [error]);

  // Navigation handlers
  const handleCreateRole = useCallback(() => {
    router.push('/admin/roles/create');
  }, [router]);

  const handleEditRole = useCallback((role: Role) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
  }, [router]);

  const handleViewRole = useCallback((role: Role) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
  }, [router]);

  const handleAssignUsers = useCallback((role: Role) => {
    router.push(`/admin/roles/${role.id}/assign-users`);
  }, [router]);

  const handleManagePermissions = useCallback((role: Role) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
  }, [router]);

const handleRowClick = (role: any, event?: React.MouseEvent) => {
  router.push(`/admin/roles/edit?id=${role.id}`);
}

  // Delete handler
  const handleDeleteRole = useCallback(async (role: Role) => {
    const confirmMessage = `Delete Role: ${role.name}

This action cannot be undone. Are you sure you want to delete this role?

Role Details:
• Name: ${role.name}
• Slug: ${role.slug}
• Permissions: ${role.permissions?.length || 0}
• Status: ${role.isActive ? 'Active' : 'Inactive'}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(role.id);
    try {
      const result = await deleteRoleMutation.mutateAsync(role.id);
      if (result.success) {
        toast.success(`Role "${role.name}" has been deleted successfully`);
      } else {
        toast.error(result.error || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  }, [deleteRoleMutation]);

  // Calculate stats
  const stats = {
    totalRoles: roles.length,
    activeRoles: roles.filter(role => role.isActive).length,
    recentRoles: roles.filter(role => {
      if (!role.createdAt) return false;
      const createdDate = new Date(role.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate > sevenDaysAgo;
    }).length
  };

  return {
    // Data
    roles,
    loading,
    error,
    stats,
    deleteLoading,
    
    // Actions
    handleCreateRole,
    handleEditRole,
    handleViewRole,
    handleDeleteRole,
    handleAssignUsers,
    handleManagePermissions,
    handleRowClick,
    fetchRoles
  };
}
