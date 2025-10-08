import { userApiService } from '@/lib/api/userApiService';
import type { CreateUserData, UpdateUserData, UserFilters } from '@/lib/types/user';
import { useBaseEntity } from './useBaseEntity';

const userApiAdapter = {
  getAll: (filters?: UserFilters) => userApiService.getUsers(filters),
  getById: (id: number) => userApiService.getUserById(id),
  create: (data: CreateUserData) => userApiService.createUser(data),
  update: (id: number, data: UpdateUserData) => userApiService.updateUser(id, data),
  delete: (id: number) => userApiService.deleteUser(id),
};

export function useUsers() {
  const baseEntity = useBaseEntity(
    userApiAdapter as any,
    { page: 1, limit: 10 },
    'users'
  );

  return {
    users: baseEntity.items,
    loading: baseEntity.loading,
    error: baseEntity.error,
    pagination: baseEntity.pagination,
    filters: baseEntity.filters,
    // Rename methods to be user-specific
    fetchUsers: baseEntity.fetchItems,
    createUser: baseEntity.createItem,
    updateUser: baseEntity.updateItem,
    deleteUser: baseEntity.deleteItem,
    updateUserStatus: baseEntity.updateItemStatus,
    getUserById: baseEntity.getItemById,
    updateFilters: baseEntity.updateFilters,
    clearFilters: baseEntity.clearFilters,
    clearError: baseEntity.clearError,
    handleSubmit: baseEntity.handleSubmit,
  };
}