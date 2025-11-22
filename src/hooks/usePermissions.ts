import { Permission, CreatePermissionInput } from '@/types/rbac';
import { PermissionApiService } from '@/lib/api/permissionApiService';
import { useBaseMutation, useBaseQuery } from './useBaseApi';

export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'],
  list: (filters: any) => [...permissionKeys.lists(), { filters }],
  details: () => [...permissionKeys.all, 'detail'],
  detail: (id: string) => [...permissionKeys.details(), id],
  byResource: (resource: string) => [...permissionKeys.all, 'resource', resource],
};

// Hooks
export function usePermissions() {
  return useBaseQuery<Permission[]>(
    permissionKeys.lists(),
    '/permissions',
    {
      staleTime: 10 * 60 * 1000, 
    }
  );
}

export function usePermissionsByResource(resource: string) {
  return useBaseQuery<Permission[]>(
    permissionKeys.byResource(resource),
    `/permissions/resource/${resource}`,
    {
      enabled: !!resource,
    }
  );
}

export function usePermissionById(id: string) {
  return useBaseQuery<Permission>(
    permissionKeys.detail(id),
    `/permissions/${id}`,
    {
      enabled: !!id,
    }
  );
}

export function useCreatePermission() {
  return useBaseMutation<Permission, CreatePermissionInput>(
    (data: CreatePermissionInput) => PermissionApiService.createPermission(data),
  );
}

// Note: For checking current user's permissions, use useHasPermissions() hook instead
// These functions are for checking other users' permissions via API