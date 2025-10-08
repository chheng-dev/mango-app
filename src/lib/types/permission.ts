// Centralized permission types to avoid duplication across the app

export interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePermissionData {
  name: string;
  resource: string;
  action: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionData {
  name?: string;
  resource?: string;
  action?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface PermissionFilters {
  search?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
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

// Helper function to generate slug from resource and action
export function generatePermissionSlug(resource: string, action: string): string {
  return `${resource}_${action}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Helper function to validate slug format
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9_-]+$/.test(slug);
}

// Helper function to generate default description
export function generatePermissionDescription(resource: string, action: string): string {
  return `${action} permissions for ${resource}`;
}
