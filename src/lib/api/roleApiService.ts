/**
 * Client-side API service for roles
 * This handles HTTP requests to the backend API routes
 */

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  permissions?: Permission[];
  userCount?: number;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

export interface CreateRoleData {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
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

class RoleApiService {
  private baseUrl = '/api/rbac/roles';

  async getAllRoles(options: {
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

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getRoleById(id: number): Promise<ApiResponse<Role>> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async createRole(data: CreateRoleData): Promise<ApiResponse<Role>> {
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

  async updateRole(id: number, data: UpdateRoleData): Promise<ApiResponse<Role>> {
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

  async deleteRole(id: number): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.baseUrl}/${roleId}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissionIds }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async removePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.baseUrl}/${roleId}/permissions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissionIds }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getRoleWithPermissions(roleId: number): Promise<ApiResponse<Role>> {
    const response = await fetch(`${this.baseUrl}/${roleId}/permissions`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<ApiResponse<boolean>> {
    const response = await fetch(`${this.baseUrl}/${roleId}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissionIds }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

export const roleApiService = new RoleApiService();
export default roleApiService;
