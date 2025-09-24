import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissionsListHook, useDeletePermission } from '@/hooks/usePermissionsData';
import { Permission } from '@/lib/api/permissionApiService';
import { toast } from '@/lib/utils/toast';

export function usePermissionsPage() {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Use the permissions hook for data fetching
  const {
    data: permissionsResponse,
    isLoading: loading,
    error,
    refetch: fetchPermissions
  } = usePermissionsListHook({
    page: 1,
    limit: 100, // Get all permissions for simplicity
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const deletePermissionMutation = useDeletePermission();

  const permissions = permissionsResponse?.data || [];

  useEffect(() => {
    if (error) {
      toast.error('Failed to load permissions');
    }
  }, [error]);

  // Navigation handlers
  const handleCreatePermission = useCallback(() => {
    router.push('/admin/permissions/create');
  }, [router]);

  const handleEditPermission = useCallback((permission: Permission) => {
    router.push(`/admin/permissions/edit?id=${permission.id}`);
  }, [router]);

  const handleViewPermission = useCallback((permission: Permission) => {
    setSelectedPermission(permission);
    setIsViewModalOpen(true);
  }, []);

  // Delete handler
  const handleDeletePermission = useCallback(async (permission: Permission) => {
    const confirmMessage = `Delete Permission: ${permission.name}

This action cannot be undone. Are you sure you want to delete this permission?

Permission Details:
• Name: ${permission.name}
• Slug: ${permission.slug}
• Resource: ${permission.resource}
• Action: ${permission.action}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(permission.id);
    try {
      await deletePermissionMutation.mutateAsync(permission.id);
      toast.success(`Permission "${permission.name}" has been deleted successfully`);
      fetchPermissions();
    } catch (error) {
      console.error('Failed to delete permission:', error);
      toast.error('Failed to delete permission. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  }, [deletePermissionMutation, fetchPermissions]);

  // Modal handlers
  const handleCloseViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setSelectedPermission(null);
  }, []);

  const handleEditFromView = useCallback(() => {
    if (selectedPermission) {
      setIsViewModalOpen(false);
      handleEditPermission(selectedPermission);
    }
  }, [selectedPermission, handleEditPermission]);

  return {
    // Data
    permissions,
    loading,
    error,
    deleteLoading,
    selectedPermission,
    isViewModalOpen,
    
    // Actions
    handleCreatePermission,
    handleEditPermission,
    handleViewPermission,
    handleDeletePermission,
    handleCloseViewModal,
    handleEditFromView,
    fetchPermissions
  };
}
