import { CreateRoleInput, UpdateRoleInput } from "@/types/rbac";
import { Role, CreateRoleData, UpdateRoleData } from "../types/role";

export class RoleApiService {
  static async getAllRoles(filters?: any): Promise<Role[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const url = params.toString() ? `/api/roles?${params}` : '/api/roles';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    return response.json();
  }

  static async getRoles(): Promise<Role[]> {
    return this.getAllRoles();
  }

  static async getRoleById(id: string | number): Promise<Role> {
    const response = await fetch(`/api/roles/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }
    return response.json();
  }

  static async createRole(data: CreateRoleInput | CreateRoleData): Promise<Role> {
    const response = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create role');
    }
    return response.json();
  }

  static async updateRole(id: string | number, data: UpdateRoleInput | UpdateRoleData): Promise<Role> {
    const response = await fetch(`/api/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update role');
    }   
    return response.json();
  }

  static async deleteRole(id: string | number): Promise<void> {
    const response = await fetch(`/api/roles/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete role');
    }   
    return;
  }

  static async countPermissions(roleId: number): Promise<number> {
    const response = await fetch(`/api/roles/${roleId}/permissions/count`);
    if (!response.ok) {
      throw new Error('Failed to count permissions');
    }
    const result = await response.json();
    return result.count || 0;
  }

  static async countUsers(roleId: number): Promise<number> {
    const response = await fetch(`/api/roles/${roleId}/users/count`);
    if (!response.ok) {
      throw new Error('Failed to count users');
    }
    const result = await response.json();
    return result.count || 0;
  }
}

export const roleApiService = RoleApiService;
export default roleApiService;