import roleApiService from '@/lib/api/roleApiService';
import { useQuery } from '@tanstack/react-query';

interface UseRoleWithPermissionsProps {
  roleId?: string | number;
  enabled?: boolean;
}

export function useRoleWithPermissions({ 
  roleId, 
  enabled = true 
}: UseRoleWithPermissionsProps) {
  const {
    data: role,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['roles-with-permissions', roleId],
    queryFn: async () => {
      if (!roleId) throw new Error('Role ID is required');
      const response = await roleApiService.getRoleWithPermissions(Number(roleId));
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch role with permissions');
      }
      return response.data!;
    },
    enabled: enabled && !!roleId,
  });

  return {
    role,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  };
}
