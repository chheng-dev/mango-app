import { useState, useCallback } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface BaseApiService<T extends BaseEntity, CreateData, UpdateData, Filters extends BaseFilters> {
  getAll(filters?: Filters): Promise<ApiResponse<T[]>>;
  getById(id: number): Promise<ApiResponse<T>>;
  create(data: CreateData): Promise<ApiResponse<T>>;
  update(id: number, data: UpdateData): Promise<ApiResponse<T>>;
  delete(id: number): Promise<ApiResponse<boolean>>;
}

export interface UseBaseEntityReturn<T extends BaseEntity, CreateData, UpdateData, Filters extends BaseFilters> {
  items: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: Filters;
  fetchItems: (newFilters?: Filters) => Promise<void>;
  createItem: (data: CreateData) => Promise<ApiResponse<T>>;
  updateItem: (id: number, updates: UpdateData) => Promise<ApiResponse<T>>;
  deleteItem: (id: number) => Promise<ApiResponse<boolean>>;
  updateItemStatus: (id: number, isActive: boolean) => Promise<ApiResponse<T>>;
  getItemById: (id: number) => Promise<ApiResponse<T>>;
  updateFilters: (newFilters: Partial<Filters>) => void;
  clearFilters: () => void;
  clearError: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

// Generate query keys for TanStack Query
function generateQueryKeys<T extends BaseEntity>(entityName: string) {
  return {
    all: [entityName] as const,
    lists: () => [entityName, 'list'] as const,
    list: (filters: any) => [entityName, 'list', filters] as const,
    details: () => [entityName, 'detail'] as const,
    detail: (id: number) => [entityName, 'detail', id] as const,
  };
}

export function useBaseEntity<
  T extends BaseEntity,
  CreateData extends FieldValues,
  UpdateData,
  Filters extends BaseFilters
>(
  apiService: BaseApiService<T, CreateData, UpdateData, Filters>,
  initialFilters: Partial<Filters> = {},
  entityName: string = 'entity' // Add entityName for query keys
): UseBaseEntityReturn<T, CreateData, UpdateData, Filters> {
  const queryClient = useQueryClient();
  const { handleSubmit } = useForm<CreateData>();
  
  const [filters, setFilters] = useState<Filters>({
    ...initialFilters,
    page: 1,
    limit: 10,
  } as Filters);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const queryKeys = generateQueryKeys<T>(entityName);

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.list(filters),
    queryFn: async () => {
      console.log('🔍 useQuery queryFn executing with filters:', filters);
      const response = await apiService.getAll(filters);
      console.log('📦 API response received:', response);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch items');
      }
      if (response.pagination) {
        console.log('📊 Setting pagination from API:', response.pagination);
        setPagination(response.pagination);
      }
      return response.data || [];
    },
    staleTime: 0, // Always treat data as stale - force fresh fetch
    gcTime: 0, // Don't cache for pagination
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const items = queryData || [];
  const error = queryError?.message || null;

  // Fetch items function
  const fetchItems = useCallback(async (newFilters?: Filters) => {
    if (newFilters) {
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
    await refetch();
  }, [refetch]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (itemData: CreateData) => {
      const response = await apiService.create(itemData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create item');
      }
      return response;
    },
    onSuccess: (response) => {
      // Invalidate and refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      
      // Optimistically update the cache
      if (response.data) {
        queryClient.setQueryData<T[]>(queryKeys.list(filters), (old) => 
          old ? [response.data!, ...old] : [response.data!]
        );
      }
    },
    onError: (error) => {
      console.error('Create failed:', error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateData }) => {
      const response = await apiService.update(id, updates);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update item');
      }
      return response;
    },
    onSuccess: (response, { id }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      
      // Optimistically update the cache
      if (response.data) {
        queryClient.setQueryData<T[]>(queryKeys.list(filters), (old) =>
          old ? old.map(item => item.id === id ? { ...item, ...response.data } : item) : []
        );
      }
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete item');
      }
      return response;
    },
    onSuccess: (_, id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
      
      // Optimistically update the cache
      queryClient.setQueryData<T[]>(queryKeys.list(filters), (old) =>
        old ? old.filter(item => item.id !== id) : []
      );
    },
    onError: (error) => {
      console.error('Delete failed:', error);
    }
  });

  // Get item by ID with TanStack Query
  const getItemById = useCallback(async (id: number): Promise<ApiResponse<T>> => {
    try {
      const cachedData = queryClient.getQueryData<T>(queryKeys.detail(id));
      if (cachedData) {
        return { success: true, data: cachedData };
      }

      const response = await queryClient.fetchQuery({
        queryKey: queryKeys.detail(id),
        queryFn: async () => {
          const result = await apiService.getById(id);
          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch item');
          }
          return result.data!;
        },
        staleTime: 5 * 60 * 1000,
      });

      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch item';
      return { success: false, error: errorMessage };
    }
  }, [apiService, queryClient, queryKeys]);

  // Wrapper functions
  const createItem = useCallback(async (data: CreateData): Promise<ApiResponse<T>> => {
    try {
      const response = await createMutation.mutateAsync(data);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      return { success: false, error: errorMessage };
    }
  }, [createMutation]);

  const updateItem = useCallback(async (id: number, updates: UpdateData): Promise<ApiResponse<T>> => {
    try {
      const response = await updateMutation.mutateAsync({ id, updates });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      return { success: false, error: errorMessage };
    }
  }, [updateMutation]);

  const deleteItem = useCallback(async (id: number): Promise<ApiResponse<boolean>> => {
    try {
      const response = await deleteMutation.mutateAsync(id);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      return { success: false, error: errorMessage };
    }
  }, [deleteMutation]);

  // Update item status
  const updateItemStatus = useCallback(async (id: number, isActive: boolean): Promise<ApiResponse<T>> => {
    return updateItem(id, { isActive } as UpdateData);
  }, [updateItem]);

  // Clear error
  const clearError = useCallback(() => {
    // TanStack Query handles errors automatically, but we can reset mutations if needed
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  }, [createMutation, updateMutation, deleteMutation]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    console.log('🔧 useBaseEntity.updateFilters called with:', newFilters);
    setFilters(prev => {
      console.log('📋 Current filters before update:', prev);
      const updated = { ...prev, ...newFilters };
      console.log('📋 New filters after update:', updated);
      return updated;
    });
    // Invalidate all list queries to force fresh fetch
    queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
  }, [queryClient, queryKeys]); // Add dependencies for invalidation

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ ...initialFilters, page: 1, limit: 10 } as Filters);
  }, [initialFilters]);

  // Form submit handler
  const onFormSubmit = handleSubmit(async (data: CreateData) => {
    await createItem(data);
  });

  return {
    items,
    loading: loading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    pagination,
    filters,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    updateItemStatus,
    getItemById,
    updateFilters,
    clearFilters,
    clearError,
    handleSubmit: onFormSubmit,
  };
}
