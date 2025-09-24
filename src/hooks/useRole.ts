import { useQuery } from '@tanstack/react-query';

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface RoleResponse {
  success: boolean;
  data: Role;
  error?: string;
}

export function useRole(roleId: string | null) {
  return useQuery({
    queryKey: ['roles', roleId],
    queryFn: async (): Promise<RoleResponse> => {
      if (!roleId) {
        throw new Error('Role ID is required');
      }
      
      const response = await fetch(`/api/rbac/roles/${roleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch role');
      }
      return response.json();
    },
    enabled: !!roleId
  });
}
