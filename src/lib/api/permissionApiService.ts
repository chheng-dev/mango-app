import { apiClient } from '@/lib/api-client';
import {
  Role,
  Permission,
  User,
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
} from '@/types/rbac';

export class PermissionApiService {
  static async getPermissions(): Promise<Permission[]> {
    return apiClient.get<Permission[]>('/permissions');
  }

  static async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return apiClient.get<Permission[]>(`/permissions/resource/${resource}`);
  }

  static async createPermission(data: CreatePermissionInput): Promise<Permission> {
    return apiClient.post<Permission>('/permissions', data);
  }

  // Role endpoints
  static async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>('/roles');
  }

  static async getRoleById(id: string): Promise<Role> {
    return apiClient.get<Role>(`/roles/${id}`);
  }

  static async createRole(data: CreateRoleInput): Promise<Role> {
    return apiClient.post<Role>('/roles', data);
  }

  static async updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
    return apiClient.put<Role>(`/roles/${id}`, data);
  }

  static async deleteRole(id: string): Promise<void> {
    return apiClient.delete(`/roles/${id}`);
  }

  static async getUserWithRole(userId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}/permissions`);
  }

  static async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    return apiClient.put(`/users/${userId}/role`, { roleId });
  }

  // Permission check endpoints
  static async checkUserPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<{ hasPermission: boolean }> {
    return apiClient.get<{ hasPermission: boolean }>(
      `/users/${userId}/permissions/check?resource=${resource}&action=${action}`
    );
  }

  static async checkMultiplePermissions(
    userId: string,
    checks: Array<{ resource: string; action: string }>
  ): Promise<{ hasAll: boolean; hasAny: boolean }> {
    return apiClient.post<{ hasAll: boolean; hasAny: boolean }>(
      `/users/${userId}/permissions/check-multiple`,
      { checks }
    );
  }
}

export const permissionApiService = new PermissionApiService();