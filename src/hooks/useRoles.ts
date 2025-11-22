import { useBaseMutation, useBaseQuery } from "./useBaseApi";
import { RoleApiService } from "@/lib/api/roleApiService";
import { Role } from "@/lib/types/role";
import { useUser } from "@/providers/user-provider";
import { CreateRoleInput, UpdateRoleInput } from "@/types/rbac";

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'],
  list: (filters: any) => [...roleKeys.lists(), { filters }],
  details: () => [...roleKeys.all, 'detail'],
  detail: (id: string) => [...roleKeys.details(), id],
};

export function useRoles() {
  const { user, isLoading } = useUser();

  return useBaseQuery<Role[]>(
    roleKeys.lists(),
    '/roles',
    {
      enabled: !!user && !isLoading,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000,
    }
  );
}

export function useRoleById(id: string) {
  return useBaseQuery<Role>(
    roleKeys.detail(id),
    `/roles/${id}`,
    {
      enabled: !!id,
    }
  );
}

export function useCreateRole() {
  return useBaseMutation<Role, CreateRoleInput>(
    (data: CreateRoleInput) => RoleApiService.createRole(data),
  );
}

export function useUpdateRole(id: string) {
  return useBaseMutation<Role, UpdateRoleInput>(
    (data: UpdateRoleInput) => RoleApiService.updateRole(id, data),
  );
} 
