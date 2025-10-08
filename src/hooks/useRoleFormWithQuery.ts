import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  type RoleFormData,
  roleFormSchema,
  generateSlugFromName
} from '@/lib/validations/role';
import { Role } from '@/lib/types/role';
import { Permission } from '@/lib/types/permission';
import roleApiService from '@/lib/api/roleApiService';

interface UseRoleFormWithQueryProps {
  roleId?: string | number;
  mode: 'create' | 'edit';
  onSuccess?: (role: Role) => void;
  onError?: (error: Error) => void;
}

export function useRoleFormWithQuery({ 
  roleId,
  mode,
  onSuccess,
  onError 
}: UseRoleFormWithQueryProps) {
  const queryClient = useQueryClient();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    data: roleWithPermissionsData,
    isLoading: isLoadingRoleWithPermissions,
    error: roleError,
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
    enabled: mode === 'edit' && !!roleId,
  });

  const {
    data: allPermissionsData,
    isLoading: isLoadingAllPermissions,
  } = useQuery({
    queryKey: ['permissions'],
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

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isActive: true,
      permissions: [],
    },
    mode: 'all', // Validate on change, blur, and submit
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = form;

  const watchedName = watch('name');
  const watchedSlug = watch('slug');
  const watchedDescription = watch('description');
  const watchedPermissions = watch('permissions');
  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (watchedName && !isSlugManuallyEdited) {
      const generatedSlug = generateSlugFromName(watchedName);
      setValue('slug', generatedSlug, { 
        shouldValidate: true,
        shouldDirty: true 
      });
    }
  }, [watchedName, setValue, isSlugManuallyEdited]);

  useEffect(() => {
    if (roleWithPermissionsData && mode === 'edit') {
      reset({
        name: roleWithPermissionsData.name,
        slug: roleWithPermissionsData.slug,
        description: roleWithPermissionsData.description || '',
        isActive: roleWithPermissionsData.isActive ?? true,
        permissions: roleWithPermissionsData.permissions?.map((p: Permission) => p.id) || [],
      });
    }
  }, [roleWithPermissionsData, mode, reset]);

  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await roleApiService.createRole({
        name: data.name,
        slug: data.slug,
        description: data.description,
        isActive: data.isActive,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create role');
      }

      if (data.permissions.length > 0) {
        const permResponse = await roleApiService.assignPermissions(
          response.data!.id,
          data.permissions
        );
        if (!permResponse.success) {
          throw new Error(permResponse.error || 'Failed to assign permissions');
        }
      }

      return response.data!;
    },
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully!');
      onSuccess?.(role);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create role');
      onError?.(error);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      if (!roleId) throw new Error('Role ID is required for update');
      
      const response = await roleApiService.updateRole(Number(roleId), {
        name: data.name,
        slug: data.slug,
        description: data.description,
        isActive: data.isActive,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update role');
      }

      // Update permissions
      const permResponse = await roleApiService.updateRolePermissions(
        Number(roleId),
        data.permissions
      );
      if (!permResponse.success) {
        throw new Error(permResponse.error || 'Failed to update permissions');
      }

      return response.data!;
    },
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
      toast.success('Role updated successfully!');
      onSuccess?.(role);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
      onError?.(error);
    },
  });

  // Handle form submission
  const onFormSubmit = handleSubmit(async (data) => {
    try {
      if (mode === 'create') {
        await createRoleMutation.mutateAsync(data);
      } else {
        await updateRoleMutation.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Form submission error:', error);
    }
  });

  // Manual slug editing handlers
  const enableSlugEditing = () => {
    setIsSlugManuallyEdited(true);
  };

  const disableSlugEditing = () => {
    setIsSlugManuallyEdited(false);
    if (watchedName) {
      const generatedSlug = generateSlugFromName(watchedName);
      setValue('slug', generatedSlug, { 
        shouldValidate: true,
        shouldDirty: true 
      });
    }
  };

  // Handle permissions change with validation
  const handlePermissionsChange = (permissions: number[]) => {
    setValue('permissions', permissions, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };

  // Reset form to initial values
  const resetForm = () => {
    if (mode === 'edit' && roleWithPermissionsData) {
      reset({
        name: roleWithPermissionsData.name,
        slug: roleWithPermissionsData.slug,
        description: roleWithPermissionsData.description || '',
        isActive: roleWithPermissionsData.isActive ?? true,
        permissions: roleWithPermissionsData.permissions?.map((p: Permission) => p.id) || [],
      });
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        permissions: [],
      });
    }
    setIsSlugManuallyEdited(false);
  };

  return {
    // React Hook Form methods
    register,
    handleSubmit: onFormSubmit,
    watch,
    setValue,
    reset: resetForm,
    
    // Form state
    errors,
    isSubmitting: isSubmitting || createRoleMutation.isPending || updateRoleMutation.isPending,
    isValid,
    isDirty,
    
    // Query state
    isLoadingRole: isLoadingRoleWithPermissions,
    isLoadingPermissions: isLoadingAllPermissions,
    roleError,
    permissions: allPermissionsData || [],
    roleData: roleWithPermissionsData,
    
    // Watched values
    formData: {
      name: watchedName || '',
      slug: watchedSlug || '',
      description: watchedDescription || '',
      isActive: watchedIsActive ?? true,
      permissions: watchedPermissions || [],
    },
    
    // Custom handlers
    handlePermissionsChange,
    enableSlugEditing,
    disableSlugEditing,
    isSlugManuallyEdited,
    
    // Mutation states
    createRole: createRoleMutation,
    updateRole: updateRoleMutation,
    
    // Form utilities
    form, // Access to full form object if needed
  };
}
