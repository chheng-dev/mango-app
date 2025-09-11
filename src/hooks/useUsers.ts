import { useState, useCallback, useEffect } from 'react';
import { userService, User, ApiResponse } from '@/lib/api/UserService';

export interface UserFilters {
  search?: string;
  status?: 'active' | 'inactive';
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  code: string;
  password: string;
  passwordConfirmation: string;
  phoneNumber?: string;
  dob?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<UserFilters>({});

  // Fetch users
  const fetchUsers = useCallback(async (newFilters?: UserFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = { ...filters, ...newFilters };
      const response = await userService.getUsers(filterParams);
      
      if (response.success && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create user
  const createUser = useCallback(async (userData: CreateUserData): Promise<ApiResponse<User>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.createUser({
        ...userData,
        passwordHash: userData.password, // This would be hashed on the server
      });
      
      if (response.success && response.data) {
        setUsers(prev => [response.data!, ...prev]);
        return response;
      } else {
        setError(response.error || 'Failed to create user');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (id: number, updates: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateUser(id, updates);
      
      if (response.success && response.data) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...response.data } : user
        ));
        return response;
      } else {
        setError(response.error || 'Failed to update user');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.deleteUser(id);
      
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
        return response;
      } else {
        setError(response.error || 'Failed to delete user');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user status
  const updateUserStatus = useCallback(async (id: number, isActive: boolean): Promise<ApiResponse<User>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateUserStatus(id, isActive);
      
      if (response.success && response.data) {
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, isActive: response.data!.isActive } : user
        ));
        return response;
      } else {
        setError(response.error || 'Failed to update user status');
        return response;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Initialize - fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateFilters,
    clearFilters,
    clearError,
  };
}