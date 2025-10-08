import { ApiResponse } from "@/types/api";
import { BaseApiService } from "./baseApiService";
import { Permission, PermissionFilters } from "../types/permission";
class PermissionApiService extends BaseApiService {
  constructor() {
    super('/api/rbac/permissions');
  }

  async getAllPermissions(filters: PermissionFilters): Promise<ApiResponse<Permission[]>> {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.query) params.set("query", filters.query);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.resource) params.set("resource", filters.resource);
    if (filters.action) params.set("action", filters.action);

    return this.get<Permission[]>("", params);
  }

  async getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    return await this.get<Permission>(`/${id}`);
  }

  async createPermission(data: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return this.post<Permission>('', data);
  }

  async updatePermission(id: number, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return this.put<Permission>(`/${id}`, data);
  }

  async deletePermission(id: number): Promise<ApiResponse<boolean>> {
    return this.delete<boolean>(`/${id}`);
  }

  async getPermissionsByResource(resource: string): Promise<ApiResponse<Permission[]>> {
    return await this.get<Permission[]>('/permissions', new URLSearchParams({ resource }));
  }

  async getUniqueResources(): Promise<ApiResponse<string[]>> {
    return await this.get<string[]>('/resources');
  }

  async getPermissionsGroupedByResource(): Promise<ApiResponse<Record<string, Permission[]>>> {
    return await this.get<Record<string, Permission[]>>('/grouped');
  }
}

export const permissionApiService = new PermissionApiService();
export default permissionApiService;
