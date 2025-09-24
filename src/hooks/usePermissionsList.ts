import { useQuery } from '@tanstack/react-query';

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

interface PermissionsListResponse {
  success: boolean;
  data: Permission[];
  pagination?: any;
  error?: string;
}

export function usePermissionsList() {
  return useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: async (): Promise<PermissionsListResponse> => {
      const response = await fetch('/api/rbac/permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      return response.json();
    },
  });
}
