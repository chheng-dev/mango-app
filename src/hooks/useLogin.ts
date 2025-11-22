import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useUser } from '@/providers/user-provider';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginCredentials = z.infer<typeof loginSchema>;

interface ValidationErrors {
  email?: string;
  password?: string;
}

interface UseLoginReturn {
  email: string;
  password: string;
  isLoading: boolean;
  errors: ValidationErrors;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  login: () => void;
  clearErrors: () => void;
}

export function useLogin(): UseLoginReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const router = useRouter();
  const { refetch } = useUser();

  const clearErrors = () => setErrors({});

  const validateField = (field: keyof ValidationErrors, value: string) => {
    try {
      const fieldSchema = loginSchema.pick({ [field]: true } as any);
      fieldSchema.parse({ [field]: value });
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.issues[0]?.message }));
      }
    }
  };

  const setEmailWithValidation = (value: string) => {
    setEmail(value);
    if (errors.email) {
      validateField('email', value);
    }
  };

  const setPasswordWithValidation = (value: string) => {
    setPassword(value);
    if (errors.password) {
      validateField('password', value);
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      return data;
    },
    onSuccess: async () => {
      await refetch();
      router.push('/en/admin');
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      // Set server error as a general field error or show in a toast
      setErrors({ email: error.message || 'An unexpected error occurred' });
    },
  });

  const login = () => {
    clearErrors();

    try {
      const validatedData = loginSchema.parse({ email, password });
      loginMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: ValidationErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ValidationErrors] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return {
    email,
    password,
    isLoading: loginMutation.isPending,
    errors,
    setEmail: setEmailWithValidation,
    setPassword: setPasswordWithValidation,
    login,
    clearErrors,
  };
}
