import { ApiResponse } from "@/types/api";
import { BaseApiService } from "./baseApiService";
import { CreateRoleData, Role, UpdateRoleData } from "../types/role";

class RoleApiService extends BaseApiService {
  constructor() {
    super('/api/rbac/roles');
  }

  getAllRoles(options: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includePermissions?: boolean;
  } = {}): Promise<ApiResponse<Role[]>> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', options.page.toString());  
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.query) params.set('query', options.query);
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);
    if (options.includePermissions) params.set('includePermissions', 'true');
    
    return this.get<Role[]>('', params);
  }

  getRoleById(id: number): Promise<ApiResponse<Role>> {
    return this.get<Role>(`/${id}`);
  }

  createRole(data: CreateRoleData): Promise<ApiResponse<Role>> {
    return this.post<Role>('', data);
  }

  updateRole(id: number, data: UpdateRoleData): Promise<ApiResponse<Role>> {
    return this.put<Role>(`/${id}`, data);
  }

  deleteRole(id: number): Promise<ApiResponse<boolean>> {
    return this.delete<boolean>(`/${id}`);
  }

  assignPermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    return this.post<boolean>(`/${roleId}/permissions`, { permissionIds });
  }

  removePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    return this.delete<boolean>(`/${roleId}/permissions`, { permissionIds } as any);
  }

  getRoleWithPermissions(roleId: number): Promise<ApiResponse<Role>> {
    return this.get<Role>(`/${roleId}/permissions`);
  }

  updateRolePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    return this.put<boolean>(`/${roleId}/permissions`, { permissionIds });
  }

  countPermissions(roleId: number): Promise<ApiResponse<number>> {
    return this.get<number>(`/${roleId}/permissions/count`);
  }

  countUsers(roleId: number): Promise<ApiResponse<number>> {
    return this.get<number>(`/${roleId}/user/count`);
  }
}

export const roleApiService = new RoleApiService();
export default roleApiService;