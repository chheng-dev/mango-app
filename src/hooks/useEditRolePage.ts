import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/lib/utils/toast';
import { useRole } from './useRole';
import { usePermissionsList } from './usePermissionsList';
import { useUpdateRole } from './useUpdateRole';

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

interface EditRoleData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  permissions: number[];
}

export function useEditRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('id');
  
  // State
  const [saving, setSaving] = useState(false);

  // Fetch role data using separated hook
  const { 
    data: roleData, 
    isLoading: roleLoading, 
    error: roleError 
  } = useRole(roleId);

  // Fetch permissions using separated hook
  const { 
    data: permissionsData, 
    isLoading: permissionsLoading, 
    error: permissionsError 
  } = usePermissionsList();

  // Update role mutation
  const updateRoleMutation = useUpdateRole(roleId);

  const role = roleData?.data;
  const permissions = permissionsData?.data || [];
  const loading = roleLoading || permissionsLoading;

  // Handle form submission using mutation
  const handleSubmit = async (formData: EditRoleData) => {
    setSaving(true);
    
    try {
      await updateRoleMutation.mutateAsync(formData);
      router.push('/admin/roles');
    } catch (error) {
      // Error handling is done in the mutation hook
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/roles');
  };

  const handleBack = () => {
    router.push('/admin/roles');
  };

  const handleAction = () => {

  };

  // Prepare initial form data
  const initialData = role ? {
    name: role.name,
    slug: role.slug,
    description: role.description || '',
    isActive: role.isActive,
    permissions: role.permissions?.map((p: Permission) => p.id) || []
  } : null;

  return {
    // Data
    role,
    permissions,
    loading,
    saving: saving || updateRoleMutation.isPending,
    roleError,
    permissionsError,
    roleId,
    initialData,
    
    // Actions
    handleSubmit,
    handleCancel,
    handleBack,
    handleAction,
    
    // Mutation state
    isUpdating: updateRoleMutation.isPending,
    updateError: updateRoleMutation.error
  };
}
