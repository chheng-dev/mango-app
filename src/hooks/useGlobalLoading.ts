'use client';

import { useLoading } from '@/providers/LoadingProvider';
import { useEffect } from 'react';

/**
 * Hook to show global loading during async operations
 */
export function useGlobalLoading() {
  const { showLoading, hideLoading, setLoading } = useLoading();

  const withLoading = async <T,>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      showLoading(message);
      const result = await operation();
      return result;
    } finally {
      hideLoading();
    }
  };

  return {
    showLoading,
    hideLoading,
    setLoading,
    withLoading,
  };
}

/**
 * Hook to automatically show loading for React Query operations
 */
export function useQueryLoading(
  isLoading: boolean,
  message?: string
) {
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(isLoading, message);
  }, [isLoading, message, setLoading]);
}

/**
 * Hook for form submission loading states
 */
export function useFormLoading() {
  const { showLoading, hideLoading } = useLoading();

  const submitWithLoading = async <T,>(
    submitFn: () => Promise<T>,
    message = 'Saving...'
  ): Promise<T> => {
    try {
      showLoading(message);
      const result = await submitFn();
      return result;
    } finally {
      hideLoading();
    }
  };

  return { submitWithLoading };
}
