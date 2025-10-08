import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApiService } from '@/lib/api/userApiService';
import { User, CreateUserData, UpdateUserData, formatDateForAPI, parseUserRoles } from '@/lib/types/user';
import { userFormSchema, createRequiredPasswordSchema, UserFormData } from '@/lib/validations/user-schemas';

interface UseUserFormWithQueryProps {
  userId?: string | number;
  mode: 'create' | 'edit';
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}

export function useUserFormWithQuery({ 
  userId,
  mode,
  onSuccess,
  onError 
}: UseUserFormWithQueryProps) {
  const queryClient = useQueryClient();

  const createFormSchema = () => {
    if (mode === "create") {
      return createRequiredPasswordSchema();
    }
    return userFormSchema;
  };

  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await userApiService.getUserById(Number(userId));
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user');
      }
      return response.data!;
    },
    enabled: mode === 'edit' && !!userId,
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(createFormSchema()) as any,
    defaultValues: {
      name: '',
      email: '',
      code: '',
      password: '',
      passwordConfirmation: '',
      phoneNumber: '',
      dob: undefined,
      isActive: true,
      isVerified: false,
      roles: [],
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
  const watchedEmail = watch('email');
  const watchedCode = watch('code');
  const watchedPhoneNumber = watch('phoneNumber');
  const watchedDob = watch('dob');
  const watchedIsActive = watch('isActive');
  const watchedIsVerified = watch('isVerified');

  useEffect(() => {
    if (userData && mode === 'edit') {
      const roleIds = parseUserRoles(userData);
      
      reset({
        name: userData.name,
        email: userData.email,
        code: userData.code || '',
        password: '',
        passwordConfirmation: '',
        phoneNumber: userData.phoneNumber || '',
        dob: userData.dob || undefined,
        isActive: userData.isActive ?? true,
        isVerified: userData.isVerified ?? false,
        roles: roleIds,
      });
    }
  }, [userData, mode, reset]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const createUserData: CreateUserData = {
        ...data,
        dob: formatDateForAPI(data.dob),
        password: data.password || '',
        passwordConfirmation: data.passwordConfirmation || '',
        roles: data.roles || [],
      };
      const response = await userApiService.createUser(createUserData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create user');
      }
      return response.data!;
    },
    onSuccess: (user) => {
      toast.success('User created successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.(user);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
      onError?.(error);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (!userId) throw new Error('User ID is required for update');
      
      // Transform data for update
      const updateData: UpdateUserData = {
        ...data,
        dob: formatDateForAPI(data.dob),
        roles: data.roles || [],
      };
      
      const response = await userApiService.updateUser(Number(userId), updateData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user');
      }
      return response.data!;
    },
    onSuccess: (user) => {
      toast.success('User updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      onSuccess?.(user);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
      onError?.(error);
    },
  });

  const onFormSubmit = handleSubmit(async (data: UserFormData) => {
    console.log('Form submitted with data:', data);
    try {
      if (mode === 'create') {
        await createUserMutation.mutateAsync(data);
      } else {
        await updateUserMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  const resetForm = () => {
    if (mode === 'edit' && userData) {
      const roleIds = parseUserRoles(userData);
      reset({
        name: userData.name,
        email: userData.email,
        code: userData.code || '',
        password: '',
        passwordConfirmation: '',
        phoneNumber: userData.phoneNumber || '',
        dob: userData.dob || undefined,
        isActive: userData.isActive ?? true,
        isVerified: userData.isVerified ?? false,
        roles: roleIds,
      });
    } else {
      reset({
        name: '',
        email: '',
        code: '',
        password: '',
        passwordConfirmation: '',
        phoneNumber: '',
        dob: undefined,
        isActive: true,
        isVerified: false,
        roles: [],
      });
    }
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
    isSubmitting: isSubmitting || createUserMutation.isPending || updateUserMutation.isPending,
    isValid,
    isDirty,
    
    // Query state
    isLoadingUser,
    userError,
    userData,
    
    // Watched values
    formData: {
      name: watchedName || '',
      email: watchedEmail || '',
      code: watchedCode || '',
      phoneNumber: watchedPhoneNumber || '',
      dob: watchedDob || '',
      isActive: watchedIsActive ?? true,
      isVerified: watchedIsVerified ?? false,
    },
    
    // Form instance
    form,
    
    // Mutation state
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
  };
}
