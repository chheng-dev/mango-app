import { RoleInsert, RoleSelect, RoleWithPermissions } from '@/lib/models/RoleModel';
import { ServiceResponse } from '@/lib/services/BaseService';
import { RoleService } from '@/lib/services/RoleService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const roleService = new RoleService();

// Query keys for cache management
export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...roleQueryKeys.lists(), filters] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleQueryKeys.details(), id] as const,
  withPermissions: (id: number) => [...roleQueryKeys.detail(id), 'permissions'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Get all roles with pagination and search
 */
export function useRoles(options: {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
} = {}) {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true
  } = options;

  return useQuery({
    queryKey: roleQueryKeys.list({ page, limit, query, sortBy, sortOrder }),
    queryFn: async (): Promise<ServiceResponse<RoleSelect[]>> => {
      return await roleService.getAll({
        page,
        limit,
        query,
        sortBy,
        sortOrder
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
    queryFn: async (): Promise<ServiceResponse<RoleSelect>> => {
      return await roleService.getById(id);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get role with permissions
 */
export function useRoleWithPermissions(id: number, enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.withPermissions(id),
    queryFn: async (): Promise<ServiceResponse<RoleWithPermissions>> => {
      return await roleService.getRoleWithPermissions(id);
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
    mutationFn: async (data: RoleInsert): Promise<ServiceResponse<RoleSelect>> => {
      return await roleService.createRole(data);
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
    mutationFn: async ({ id, data }: { id: number; data: Partial<RoleInsert> }): Promise<ServiceResponse<RoleSelect>> => {
      return await roleService.updateRole(id, data);
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
    mutationFn: async (id: number): Promise<ServiceResponse<boolean>> => {
      return await roleService.delete(id);
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
      return await roleService.assignPermissions(roleId, permissionIds);
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

// ==================== UTILITY HOOKS ====================

/**
 * Hook for role form state management
 */
export function useRoleForm(initialData?: Partial<RoleInsert>) {
  const [formData, setFormData] = useState<Partial<RoleInsert>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof RoleInsert, value: any) => {
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

// Required import for useState and useEffect
import { useState, useEffect } from 'react';
