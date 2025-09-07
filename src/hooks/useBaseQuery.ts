import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useState } from "react";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {  
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  query?: string; 
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; 
}

export function useBaseQuery<TData, TParams = BaseQueryParams>(
  queryKey: (string | number | boolean | TParams)[],
  queryFn: (params: TParams) => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey,
    queryFn: () => queryFn(queryKey[queryKey.length - 1] as TParams),
    ...options
  });

  return {
    // Data
    data: query.data?.data,
    response: query.data,
    pagination: query.data?.pagination,

    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,

    // Error state
    error: query.error,
    isError: query.isError,
    apiError: query.data?.error,

    // Success state
    isSuccess: query.isSuccess,

    // Actions 
    refetch: query.refetch,

    // Status
    status: query.status,
    fetchStatus: query.fetchStatus
  };
}

export function useBaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, Error, TVariables>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  const [isLoadingState, setIsLoadingState] = useState(false);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      setIsLoadingState(true);
      return options?.onMutate?.(variables)
    },
    onSettled: (...args) => {
      setIsLoadingState(false);
      queryClient.invalidateQueries(); // Invalidate all queries to ensure data consistency
      return options?.onSettled?.(...args);
    },
    ...options,
  });

  return {
    // Data 
    data: mutation.data?.data,
    response: mutation.data,

    // Loading state
    isLoading: mutation.isPending || isLoadingState,
    isPending: mutation.isPending,

    // Error state
    isError: mutation.isError || (mutation.data && !mutation.data.success),
    apiError: mutation.data?.error,
    error: mutation.error,

    // Success state
    isSuccess: mutation.isSuccess && mutation.data?.success,

    // Actions
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    reset: mutation.reset,

    // Status
    status: mutation.status,

    // Helpers methods
    invalidateQueries: (queryKey: any[]) => queryClient.invalidateQueries({ queryKey }),
    setQueryData: (queryKey: any[], data: any) => queryClient.setQueryData(queryKey, data),
  };
}

// Parametrized query hook for dynamic parameters
export function useParametrizedQuery<TData, TParams = BaseQueryParams>(
  baseKey: string[],
  queryFn: (params: TParams) => Promise<ApiResponse<TData>>,
  initialParams?: TParams,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, Error>, 'queryKey' | 'queryFn'>
) {
  const [params, setParams] = useState<TParams>(initialParams || {} as TParams);

  const queryKey = [...baseKey, params];

  const query = useBaseQuery(queryKey, () => queryFn(params), {
    ...options,
    enabled: options?.enabled !== false // Ensure enabled is true by default
  });

  return {
    ...query,
    params,
    setParams,
    updateParams: (newParams: Partial<TParams>) => setParams(prev => ({ ...prev, ...newParams })),
    resetParams: () => setParams(initialParams || {} as TParams)
  };
}