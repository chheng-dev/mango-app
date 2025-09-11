import { RequestInit } from "next/dist/server/web/spec-extension/request";

export interface User {
  id: number;
  email: string;
  code: string;
  name: string;
  dob?: string;
  phoneNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
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

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`/api${endpoint}`, config);
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP Error: ${response.status}`,
      };
    }
    
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// User API service
export const userService = {
  // Get all users with parameters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<ApiResponse<User[]>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.query) searchParams.append('query', params.query);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.isVerified !== undefined) searchParams.append('isVerified', params.isVerified.toString());

    const queryString = searchParams.toString();
    return apiRequest<User[]>(`/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get user by ID
  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users?id=${id}`);
  },

  // Create new user
  createUser: async (userData: {
    email: string;
    name: string;
    code: string;
    passwordHash: string;
    passwordConfirmation: string;
    dob?: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (id: number, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  deleteUser: async (id: number): Promise<ApiResponse<boolean>> => {
    return apiRequest<boolean>(`/users?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Update user status
  updateUserStatus: async (id: number, isActive: boolean): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/status?id=${id}&isActive=${isActive}`, {
      method: 'PUT',
    });
  },

  // Bulk update user status
  bulkUpdateStatus: async (ids: number[], isActive: boolean): Promise<ApiResponse<boolean>> => {
    return apiRequest<boolean>('/users/status/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, isActive }),
    });
  },
};

// Authentication service
export const authService = {
  // Login
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token if login successful
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response;
  },

  // Register
  register: async (userData: {
    email: string;
    name: string;
    code: string;
    password: string;
    passwordConfirmation: string;
    dob?: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token if registration successful
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/auth/me');
  },

  // Logout
  logout: async (): Promise<ApiResponse<boolean>> => {
    const response = await apiRequest<boolean>('/auth/logout', {
      method: 'POST',
    });
    
    // Remove token
    localStorage.removeItem('authToken');
    
    return response;
  },
};