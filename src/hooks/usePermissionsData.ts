import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/utils/toast';
import { permissionApiService, Permission, CreatePermissionData, UpdatePermissionData } from '@/lib/api/permissionApiService';

export const PERMISSIONS_QUERY_KEYS = {
  all: ['permissions'] as const,
  lists: () => [...PERMISSIONS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PERMISSIONS_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PERMISSIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PERMISSIONS_QUERY_KEYS.details(), id] as const,
  resources: () => [...PERMISSIONS_QUERY_KEYS.all, 'resources'] as const,
  grouped: () => [...PERMISSIONS_QUERY_KEYS.all, 'grouped'] as const,
} as const;

// Hook for fetching all permissions
export function usePermissionsListHook(options: {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  resource?: string;
} = {}) {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.list(JSON.stringify(options)),
    queryFn: () => permissionApiService.getAllPermissions(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for fetching a single permission
export function usePermissionHook(id: number | null) {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.detail(id!),
    queryFn: () => permissionApiService.getPermissionById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook for fetching unique resources
export function usePermissionResources() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.resources(),
    queryFn: () => permissionApiService.getUniqueResources(),
    staleTime: 10 * 60 * 1000, // 10 minutes (resources change less frequently)
    retry: 2,
  });
}

// Hook for fetching permissions grouped by resource
export function usePermissionsGrouped() {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEYS.grouped(),
    queryFn: () => permissionApiService.getPermissionsGroupedByResource(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook for creating a permission
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionData) => permissionApiService.createPermission(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEYS.all });
      if (result.success) {
        toast.success(result.message || 'Permission created successfully');
      }
    },
    onError: (error: Error) => {
      console.error('Create permission error:', error);
      toast.error(error.message || 'Failed to create permission');
    },
  });
}

// Hook for updating a permission
export function useUpdatePermission(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePermissionData) => permissionApiService.updatePermission(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEYS.detail(id) });
      if (result.success) {
        toast.success(result.message || 'Permission updated successfully');
      }
    },
    onError: (error: Error) => {
      console.error('Update permission error:', error);
      toast.error(error.message || 'Failed to update permission');
    },
  });
}

// Hook for deleting a permission
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permissionApiService.deletePermission(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEYS.all });
      if (result.success) {
        toast.success(result.message || 'Permission deleted successfully');
      }
    },
    onError: (error: Error) => {
      console.error('Delete permission error:', error);
      toast.error(error.message || 'Failed to delete permission');
    },
  });
}

// Combined hook for permissions page
export function usePermissionsPage() {
  const createMutation = useCreatePermission();
  const deleteMutation = useDeletePermission();

  return {
    createMutation,
    deleteMutation,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
