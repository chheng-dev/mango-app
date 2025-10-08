import { roleApiService } from '@/lib/api/roleApiService';
import { useBaseEntity } from './useBaseEntity';
import { CreateRoleData, UpdateRoleData } from '@/lib/types/role';

const roleApiAdapter = {
  getAll: (filters?: any) => roleApiService.getAllRoles(filters),
  getById: (id: number) => roleApiService.getRoleById(id),
  create: (data: CreateRoleData) => roleApiService.createRole(data),
  update: (id: number, data: UpdateRoleData) => roleApiService.updateRole(id, data),
  delete: (id: number) => roleApiService.deleteRole(id),
};

export function useRoles() {
  const baseEntity = useBaseEntity(roleApiAdapter as any, { page: 1, limit: 10 }, 'roles');

  const countPermissionsForRole = async (roleId: number) => {
    return await roleApiService.countPermissions(roleId);
  };

  const countUsersForRole = async (roleId: number) => {
    return await roleApiService.countUsers(roleId);
  };

  return {
    ...baseEntity,
    roles: baseEntity.items,
    fetchRoles: baseEntity.fetchItems,
    createRole: baseEntity.createItem,
    updateRole: baseEntity.updateItem,
    deleteRole: baseEntity.deleteItem,
    updateRoleStatus: baseEntity.updateItemStatus,
    getRoleById: baseEntity.getItemById,
    updateFilters: baseEntity.updateFilters,
    clearFilters: baseEntity.clearFilters,
    clearError: baseEntity.clearError,
    handleSubmit: baseEntity.handleSubmit,
    countPermissionsForRole,
    countUsersForRole,
  };
}