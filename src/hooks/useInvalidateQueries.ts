/**
 * Utility hooks for managing query invalidation
 */

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/queryKeys';

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  const invalidateUserPermissions = (userId?: number) => {
    if (userId) {
      // Invalidate specific user permissions
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.permissions(userId)
      });
    } else {
      // Invalidate all user permissions
      queryClient.invalidateQueries({
        queryKey: ['user-permissions']
      });
    }
  };

  const invalidateAllUserQueries = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.users.all
    });
  };

  const invalidateAllRoleQueries = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.roles.all
    });
  };

  const invalidateRBACQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ['rbac']
    });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };

  return {
    invalidateUserPermissions,
    invalidateAllUserQueries,
    invalidateAllRoleQueries,
    invalidateRBACQueries,
    invalidateAll,
  };
}
