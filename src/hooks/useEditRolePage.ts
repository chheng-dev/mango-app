import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/utils/toast';

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

  // Fetch role data
  const { 
    data: roleData, 
    isLoading: roleLoading, 
    error: roleError 
  } = useQuery({
    queryKey: ['roles', roleId],
    queryFn: async () => {
      const response = await fetch(`/api/rbac/roles/${roleId}`);
      if (!response.ok) throw new Error('Failed to fetch role');
      return response.json();
    },
    enabled: !!roleId
  });

  // Fetch permissions
  const { 
    data: permissionsData, 
    isLoading: permissionsLoading, 
    error: permissionsError 
  } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/permissions?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
  });

  const role = roleData?.data;
  const permissions = permissionsData?.data || [];
  const loading = roleLoading || permissionsLoading;

  // Handle form submission
  const handleSubmit = async (formData: EditRoleData) => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Role updated successfully!');
        router.push('/admin/roles');
      } else {
        throw new Error(result.error || 'Failed to update role');
      }

    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
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
    saving,
    roleError,
    permissionsError,
    roleId,
    initialData,
    
    // Actions
    handleSubmit,
    handleCancel,
    handleBack
  };
}
