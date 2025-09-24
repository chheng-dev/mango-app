/**
 * Client-side API service for permissions
 * This handles HTTP requests to the backend API routes
 */

export interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePermissionData {
  name: string;
  slug?: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  slug?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class PermissionApiService {
  private baseUrl = '/api/rbac/permissions';

  async getAllPermissions(options: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    resource?: string;
  } = {}): Promise<ApiResponse<Permission[]>> {
    const params = new URLSearchParams();
    
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.query) params.set('query', options.query);
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);
    if (options.resource) params.set('resource', options.resource);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getPermissionById(id: number): Promise<ApiResponse<Permission>> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async createPermission(data: CreatePermissionData): Promise<ApiResponse<Permission>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async updatePermission(id: number, data: UpdatePermissionData): Promise<ApiResponse<Permission>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async deletePermission(id: number): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getPermissionsByResource(resource: string): Promise<ApiResponse<Permission[]>> {
    const response = await fetch(`${this.baseUrl}?resource=${encodeURIComponent(resource)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getUniqueResources(): Promise<ApiResponse<string[]>> {
    const response = await fetch(`${this.baseUrl}/resources`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getPermissionsGroupedByResource(): Promise<ApiResponse<Record<string, Permission[]>>> {
    const response = await fetch(`${this.baseUrl}/grouped`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

export const permissionApiService = new PermissionApiService();
export default permissionApiService;
