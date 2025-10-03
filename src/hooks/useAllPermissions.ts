import { useQuery } from '@tanstack/react-query';

export interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

export function useAllPermissions() {
  const {
    data: permissions,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch permissions');
      }
      return result.data as Permission[];
    },
  });

  return {
    permissions: permissions || [],
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  };
}
