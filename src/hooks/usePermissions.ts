import { permissionApiService } from '@/lib/api/permissionApiService';
import type { Permission, CreatePermissionData, UpdatePermissionData, PermissionFilters, ApiResponse } from '@/lib/types/permission';
import { useBaseEntity } from './useBaseEntity';

const permissionApiAdapter = {
  getAll: (filters?: PermissionFilters) => permissionApiService.getAllPermissions(filters),
  getById: (id: number) => permissionApiService.getPermissionById(id),
  create: (data: CreatePermissionData) => permissionApiService.createPermission(data),
  update: (id: number, data: UpdatePermissionData) => permissionApiService.updatePermission(id, data),
  delete: (id: number) => permissionApiService.deletePermission(id),
};

export function usePermissions() {
  const baseEntity = useBaseEntity(
    permissionApiAdapter as any,
    { page: 1, limit: 10 },
    'permissions'
  );

  return {
    permissions: baseEntity.items,
    loading: baseEntity.loading,
    error: baseEntity.error,
    pagination: baseEntity.pagination,
    filters: baseEntity.filters,
    fetchPermissions: baseEntity.fetchItems,
    createPermission: baseEntity.createItem,
    updatePermission: baseEntity.updateItem,
    deletePermission: baseEntity.deleteItem,
    updatePermissionStatus: baseEntity.updateItemStatus,
    getPermissionById: baseEntity.getItemById,
    updateFilters: baseEntity.updateFilters,
    clearFilters: baseEntity.clearFilters,
    clearError: baseEntity.clearError,
    handleSubmit: baseEntity.handleSubmit,
  };
}

export function usePermissionsExtended() {
  const base = usePermissions();

  const getPermissionsByResource = async (resource: string): Promise<ApiResponse<Permission[]>> => {
    return await permissionApiService.getPermissionsByResource(resource);
  };

  const getUniqueResources = async (): Promise<ApiResponse<string[]>> => {
    return await permissionApiService.getUniqueResources();
  };

  const getPermissionsGroupedByResource = async (): Promise<ApiResponse<Record<string, Permission[]>>> => {
    return await permissionApiService.getPermissionsGroupedByResource();
  };

  return {
    ...base,
    getPermissionsByResource,
    getUniqueResources,
    getPermissionsGroupedByResource,
  };
}