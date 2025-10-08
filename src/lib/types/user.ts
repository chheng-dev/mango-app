// Centralized user types to avoid duplication across the app

export interface User {
  id: number;
  email: string;
  name: string;
  code: string;
  phoneNumber?: string | null;
  dob?: Date | null;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
  }>;
  roleId?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  code?: string;
  password: string;
  passwordConfirmation: string;
  phoneNumber?: string;
  dob?: string;
  isActive?: boolean;
  isVerified?: boolean;
  roles?: number[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  code?: string;
  password?: string;
  passwordConfirmation?: string;
  phoneNumber?: string;
  dob?: string;
  isActive?: boolean;
  isVerified?: boolean;
  roles?: number[];
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'inactive';
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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

// Helper function to format date for API
export function formatDateForAPI(date: string | Date | undefined): string | undefined {
  if (!date) return undefined;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return undefined;
    
    // Format as YYYY-MM-DD for API
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Date formatting error:', error);
    return undefined;
  }
}

// Helper function to safely parse user roles
export function parseUserRoles(userData: User): number[] {
  let roleIds: number[] = [];
  
  if (userData.roles && Array.isArray(userData.roles)) {
    roleIds = userData.roles.map((role) => 
      typeof role === 'object' && role.id ? role.id : Number(role)
    ).filter(Boolean);
  } else if (userData.roleId) {
    roleIds = [Number(userData.roleId)];
  }
  
  return roleIds;
}
