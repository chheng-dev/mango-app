'use client';

import { useAuth } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { GlobalLoading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, redirectTo]);

  if (isLoading) {
    return <GlobalLoading message="Verifying access..." />;
  }

  if (!isAuthenticated) {
    return <GlobalLoading message="Redirecting to login..." />;
  }

  return <>{children}</>;
}

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
