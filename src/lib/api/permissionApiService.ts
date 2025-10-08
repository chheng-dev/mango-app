import { Permission, CreatePermissionData, UpdatePermissionData, PermissionFilters, ApiResponse } from '../types/permission';

class PermissionApiService {
  private baseUrl = '/api/rbac/permissions';

  async getAllPermissions(filters: PermissionFilters = {}): Promise<ApiResponse<Permission[]>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.resource) params.set('resource', filters.resource);
    if (filters.action) params.set('action', filters.action);
    if (filters.isActive !== undefined) params.set('isActive', filters.isActive.toString());

    try {
      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get permissions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permissions'
      };
    }
  }

  async getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Permission not found`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get permission by ID error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permission'
      };
    }
  }

  async createPermission(data: CreatePermissionData): Promise<ApiResponse<Permission>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create permission');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create permission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create permission'
      };
    }
  }

  async updatePermission(id: number, data: UpdatePermissionData): Promise<ApiResponse<Permission>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update permission');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update permission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update permission'
      };
    }
  }

  async deletePermission(id: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete permission');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete permission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete permission'
      };
    }
  }

  async getPermissionsByResource(resource: string): Promise<ApiResponse<Permission[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?resource=${encodeURIComponent(resource)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch permissions by resource');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get permissions by resource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permissions by resource'
      };
    }
  }

  async getUniqueResources(): Promise<ApiResponse<string[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/resources`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch resources');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get unique resources error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch resources'
      };
    }
  }

  async getPermissionsGroupedByResource(): Promise<ApiResponse<Record<string, Permission[]>>> {
    try {
      const response = await fetch(`${this.baseUrl}/grouped`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch grouped permissions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get permissions grouped by resource error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch grouped permissions'
      };
    }
  }
}

export const permissionApiService = new PermissionApiService();
export default permissionApiService;
