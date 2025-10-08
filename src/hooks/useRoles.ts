import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApiService, Role, CreateRoleData, UpdateRoleData, ApiResponse } from '@/lib/api/roleApiService';

// NOTE: This file could be refactored to use the base entity pattern like this:
// 
// import { useBaseEntity } from './useBaseEntity';
// 
// const roleApiAdapter = {
//   getAll: (filters?: any) => roleApiService.getAllRoles(filters),
//   getById: (id: number) => roleApiService.getRoleById(id),
//   create: (data: CreateRoleData) => roleApiService.createRole(data),
//   update: (id: number, data: UpdateRoleData) => roleApiService.updateRole(id, data),
//   delete: (id: number) => roleApiService.deleteRole(id),
// };
// 
// export function useRoles() {
//   const baseEntity = useBaseEntity(roleApiAdapter as any, { page: 1, limit: 10 });
//   
//   return {
//     roles: baseEntity.items,
//     loading: baseEntity.loading,
//     error: baseEntity.error,
//     pagination: baseEntity.pagination,
//     filters: baseEntity.filters,
//     fetchRoles: baseEntity.fetchItems,
//     createRole: baseEntity.createItem,
//     updateRole: baseEntity.updateItem,
//     deleteRole: baseEntity.deleteItem,
//     updateRoleStatus: baseEntity.updateItemStatus,
//     getRoleById: baseEntity.getItemById,
//     updateFilters: baseEntity.updateFilters,
//     clearFilters: baseEntity.clearFilters,
//     clearError: baseEntity.clearError,
//     handleSubmit: baseEntity.handleSubmit,
//   };
// }

export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...roleQueryKeys.lists(), filters] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleQueryKeys.details(), id] as const,
  withPermissions: (id: number) => [...roleQueryKeys.detail(id), 'permissions'] as const,
};

export function useRoles(options: {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
  includePermissions?: boolean;
} = {}) {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    includePermissions = true
  } = options;

  return useQuery({
    queryKey: roleQueryKeys.list({ page, limit, query, sortBy, sortOrder, includePermissions }),
    queryFn: async (): Promise<ApiResponse<Role[]>> => {
      return await roleApiService.getAllRoles({
        page,
        limit,
        query,
        sortBy,
        sortOrder,
        includePermissions
      });
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single role by ID
 */
export function useRole(id: number, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.detail(id),
    queryFn: async (): Promise<ApiResponse<Role>> => {
      return await roleApiService.getRoleById(id);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Create new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleData): Promise<ApiResponse<Role>> => {
      return await roleApiService.createRole(data);
    },
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate and refetch role lists
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
        
        // Add the new role to cache
        if (response.data) {
          queryClient.setQueryData(
            roleQueryKeys.detail(response.data.id),
            response
          );
        }
      }
    },
    onError: (error) => {
      console.error('Create role error:', error);
    },
  });
}

/**
 * Update existing role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateRoleData }): Promise<ApiResponse<Role>> => {
      return await roleApiService.updateRole(id, data);
    },
    onSuccess: (response, { id }) => {
      if (response.success) {
        // Update the specific role in cache
        queryClient.setQueryData(
          roleQueryKeys.detail(id),
          response
        );
        
        // Invalidate role lists to reflect changes
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
        
        // Also invalidate role with permissions if it exists
        queryClient.invalidateQueries({ 
          queryKey: roleQueryKeys.withPermissions(id) 
        });
      }
    },
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: roleQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousRole = queryClient.getQueryData(roleQueryKeys.detail(id));
      
      // Optimistically update
      if (previousRole) {
        queryClient.setQueryData(roleQueryKeys.detail(id), {
          ...previousRole,
          data: { ...(previousRole as any).data, ...data }
        });
      }
      
      return { previousRole };
    },
    // Rollback on error
    onError: (error, { id }, context) => {
      if (context?.previousRole) {
        queryClient.setQueryData(roleQueryKeys.detail(id), context.previousRole);
      }
      console.error('Update role error:', error);
    },
  });
}

/**
 * Delete role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ApiResponse<boolean>> => {
      return await roleApiService.deleteRole(id);
    },
    onSuccess: (response, id) => {
      if (response.success) {
        // Remove role from cache
        queryClient.removeQueries({ queryKey: roleQueryKeys.detail(id) });
        queryClient.removeQueries({ queryKey: roleQueryKeys.withPermissions(id) });
        
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('Delete role error:', error);
    },
  });
}

/**
 * Assign permissions to role
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      return await roleApiService.assignPermissions(roleId, permissionIds);
    },
    onSuccess: (response, { roleId }) => {
      if (response.success) {
        // Invalidate role with permissions
        queryClient.invalidateQueries({ 
          queryKey: roleQueryKeys.withPermissions(roleId) 
        });
        
        // Optionally invalidate role lists if they show permission counts
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('Assign permissions error:', error);
    },
  });
}

/**
 * Remove permissions from role
 */
export function useRemovePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      return await roleApiService.removePermissions(roleId, permissionIds);
    },
    onSuccess: (response, { roleId }) => {
      if (response.success) {
        // Invalidate role with permissions
        queryClient.invalidateQueries({ 
          queryKey: roleQueryKeys.withPermissions(roleId) 
        });
        
        // Optionally invalidate role lists if they show permission counts
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('Remove permissions error:', error);
    },
  });
}

/**
 * Update role permissions (replace all)
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => {
      return await roleApiService.updateRolePermissions(roleId, permissionIds);
    },
    onSuccess: (response, { roleId }) => {
      if (response.success) {
        // Invalidate role with permissions
        queryClient.invalidateQueries({ 
          queryKey: roleQueryKeys.withPermissions(roleId) 
        });
        
        // Optionally invalidate role lists if they show permission counts
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() });
      }
    },
    onError: (error) => {
      console.error('Update role permissions error:', error);
    },
  });
}

/**
 * Get role with permissions
 */
export function useRoleWithPermissions(roleId: number, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.withPermissions(roleId),
    queryFn: async (): Promise<ApiResponse<Role>> => {
      return await roleApiService.getRoleWithPermissions(roleId);
    },
    enabled: enabled && !!roleId,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook for role form state management
 */
export function useRoleForm(initialData?: Partial<CreateRoleData>) {
  const [formData, setFormData] = useState<Partial<CreateRoleData>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CreateRoleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = 'Description cannot exceed 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialData || {});
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
}

/**
 * Hook for role search functionality
 */
export function useRoleSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const rolesQuery = useRoles({
    query: debouncedQuery || undefined,
    enabled: true
  });

  return {
    searchQuery,
    setSearchQuery,
    results: rolesQuery.data?.data || [],
    isLoading: rolesQuery.isLoading,
    error: rolesQuery.error,
  };
}
