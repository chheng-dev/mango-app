import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as z from "zod";
import { userApiService, type User, type CreateUserData } from '@/lib/api/userApiService';

// Default Zod validation schema for user form
const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s'-\.]+$/, "Name contains invalid characters"),
  
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email is too long")
    .toLowerCase(),
  
  code: z
    .string()
    .trim()
    .min(1, "User code is required")
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code can only contain uppercase letters, numbers, hyphens, and underscores")
    .transform((val) => val.toUpperCase()),
  
  password: z
    .string()
    .optional(),
  
  passwordConfirmation: z
    .string()
    .optional(),
  
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((phone) => {
      if (!phone || phone === '') return true;
      // Basic phone validation
      return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s\-\(\)\.]/g, ''));
    }, "Please enter a valid phone number"),
  
  dob: z
    .union([z.string(), z.date()])
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(Date.parse(val));
    }, {
      message: "Invalid date format for Date of Birth",
    }),

  isActive: z.boolean(),
  
  isVerified: z.boolean(),
}).refine((data) => {
  // Password validation for create and edit modes
  if (data.password && data.password.length > 0) {
    // Basic password requirements
    if (data.password.length < 8) return false;
    if (!/(?=.*[a-z])/.test(data.password)) return false;
    if (!/(?=.*[A-Z])/.test(data.password)) return false;
    if (!/(?=.*\d)/.test(data.password)) return false;
    if (data.password !== data.passwordConfirmation) return false;
  }
  return true;
}, {
  message: "Password must be at least 8 characters with uppercase, lowercase, number, and passwords must match",
  path: ["passwordConfirmation"],
});

export type UserFormData = z.infer<typeof userFormSchema>;

// Helper function to format date for API
function formatDateForAPI(date: string | Date | undefined): string | undefined {
  if (!date) return undefined;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return undefined;
    
    // Format as YYYY-MM-DD for API
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Date formatting error:', error);
    return undefined;
  }
}

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
      return userFormSchema.refine((data) => {
        if (!data.password || data.password.length < 6) {
          return false;
        }
        if (data.password !== data.passwordConfirmation) {
          return false;
        }
        return true;
      }, {
        message: "Password is required and must be at least 6 characters, passwords must match",
        path: ["password"],
      });
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
    resolver: zodResolver(createFormSchema()),
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

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userData && mode === 'edit') {      
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
      });
    }
  }, [userData, mode, reset]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const createUserData: CreateUserData = {
        ...data,
        dob: formatDateForAPI(data.dob),
        passwordHash: data.password || '',
        password: data.password || '',
        passwordConfirmation: data.passwordConfirmation || '',
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
      const updateData = {
        ...data,
        dob: formatDateForAPI(data.dob),
      } as any;
      
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

  // Handle form submission
  const onFormSubmit = handleSubmit(async (data) => {
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
      reset({
        name: userData.name,
        email: userData.email,
        code: userData.code || '',
        password: '',
        passwordConfirmation: '',
        phoneNumber: userData.phoneNumber || '',
        dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
        isActive: userData.isActive ?? true,
        isVerified: userData.isVerified ?? false,
      });
    } else {
      reset({
        name: '',
        email: '',
        code: '',
        password: '',
        passwordConfirmation: '',
        phoneNumber: '',
        dob: '',
        isActive: true,
        isVerified: false,
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
