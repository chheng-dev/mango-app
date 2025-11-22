import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useBaseQuery<T>(
  key: string[],
  endpoint: string,
  options?: any
) {
  return useQuery({
    queryKey: key,
    queryFn: () => apiClient.get<T>(endpoint),
    ...options,
  });
}

export function useBaseMutation<T, V>(
  mutationFn: (data: V) => Promise<T>,
  invalidateKeys?: string[][],
  options?: any
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
    ...options,
  });
}