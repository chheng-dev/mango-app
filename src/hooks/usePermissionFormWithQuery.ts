import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { permissionApiService } from '@/lib/api/permissionApiService';
import { Permission, CreatePermissionData, UpdatePermissionData } from '@/lib/types/permission';
import { permissionFormSchema, createPermissionSchema, PermissionFormData } from '@/lib/validations/permission-schemas';

interface UsePermissionFormWithQueryProps {
  permissionId?: string | number;
  mode: 'create' | 'edit';
  onSuccess?: (permission: Permission) => void;
  onError?: (error: Error) => void;
}

export function usePermissionFormWithQuery({ 
  permissionId,
  mode,
  onSuccess,
  onError 
}: UsePermissionFormWithQueryProps) {
  const queryClient = useQueryClient();

  const createFormSchema = () => {
    if (mode === "create") {
      return createPermissionSchema;
    }
    return permissionFormSchema;
  };

  const {
    data: permissionData,
    isLoading: isLoadingPermission,
    error: permissionError,
  } = useQuery({
    queryKey: ['permissions', permissionId],
    queryFn: async () => {
      if (!permissionId) throw new Error('Permission ID is required');
      const response = await permissionApiService.getPermissionById(Number(permissionId));
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch permission');
      }
      return response.data!;
    },
    enabled: mode === 'edit' && !!permissionId,
  });

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(createFormSchema()) as any, // Type assertion to handle conditional schema
    defaultValues: {
      name: '',
      resource: '',
      action: '',
      slug: '',
      description: '',
      isActive: true,
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

  // Watch form values
  const watchedName = watch('name');
  const watchedResource = watch('resource');
  const watchedAction = watch('action');
  const watchedSlug = watch('slug');
  const watchedDescription = watch('description');
  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (permissionData && mode === 'edit') {
      reset({
        name: permissionData.name,
        resource: permissionData.resource,
        action: permissionData.action,
        slug: permissionData.slug || '',
        description: permissionData.description || '',
        isActive: permissionData.isActive ?? true,
      });
    }
  }, [permissionData, mode, reset]);

  const createPermissionMutation = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      const createPermissionData: CreatePermissionData = {
        name: data.name,
        resource: data.resource,
        action: data.action,
        slug: data.slug || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
      };
      const response = await permissionApiService.createPermission(createPermissionData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create permission');
      }
      return response.data!;
    },
    onSuccess: (permission) => {
      toast.success('Permission created successfully!');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      onSuccess?.(permission);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create permission');
      onError?.(error);
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      if (!permissionId) throw new Error('Permission ID is required for update');
      
      const updateData: UpdatePermissionData = {
        name: data.name,
        resource: data.resource,
        action: data.action,
        slug: data.slug || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
      };
      
      const response = await permissionApiService.updatePermission(Number(permissionId), updateData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update permission');
      }
      return response.data!;
    },
    onSuccess: (permission) => {
      toast.success('Permission updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', permissionId] });
      onSuccess?.(permission);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update permission');
      onError?.(error);
    },
  });

  const onFormSubmit = handleSubmit(async (data) => {
    console.log('Form submitted with data:', data);
    try {
      if (mode === 'create') {
        await createPermissionMutation.mutateAsync(data as PermissionFormData);
      } else {
        await updatePermissionMutation.mutateAsync(data as PermissionFormData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  const resetForm = () => {
    if (mode === 'edit' && permissionData) {
      reset({
        name: permissionData.name,
        resource: permissionData.resource,
        action: permissionData.action,
        slug: permissionData.slug || '',
        description: permissionData.description || '',
        isActive: permissionData.isActive ?? true,
      });
    } else {
      reset({
        name: '',
        resource: '',
        action: '',
        slug: '',
        description: '',
        isActive: true,
      });
    }
  };

  // Generate preview slug based on name
  const previewSlug = watchedName 
    ? watchedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : 'permission-slug';

  return {
    // React Hook Form methods
    register,
    handleSubmit: onFormSubmit,
    watch,
    setValue,
    reset: resetForm,
    
    // Form state
    errors,
    isSubmitting: isSubmitting || createPermissionMutation.isPending || updatePermissionMutation.isPending,
    isValid,
    isDirty,
    
    // Query state
    isLoadingPermission,
    permissionError,
    permissionData,
    
    // Watched values
    formData: {
      name: watchedName || '',
      resource: watchedResource || '',
      action: watchedAction || '',
      slug: watchedSlug || '',
      description: watchedDescription || '',
      isActive: watchedIsActive ?? true,
    },
    
    // Preview
    previewSlug,
    
    // Form instance
    form,
    
    // Mutation state
    isCreating: createPermissionMutation.isPending,
    isUpdating: updatePermissionMutation.isPending,
  };
}
