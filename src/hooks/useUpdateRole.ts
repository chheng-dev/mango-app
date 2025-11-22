import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditRoleData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  permissions: number[];
}

interface UpdateRoleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

async function updateRole(roleId: string, data: EditRoleData): Promise<UpdateRoleResponse> {
  const response = await fetch(`/api/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update role');
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to update role');
  }

  return result;
}

export function useUpdateRole(roleId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditRoleData) => {
      if (!roleId) {
        throw new Error('Role ID is required');
      }
      return updateRole(roleId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    },
  });
}
