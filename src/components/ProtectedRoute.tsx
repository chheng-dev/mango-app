'use client';

import { useAuth } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { PageSkeleton } from '@/components/ui/page-skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  skeletonVariant?: 'dashboard' | 'table' | 'form' | 'profile';
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  skeletonVariant = 'dashboard'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoading) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, isInitialized, router, redirectTo]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <PageSkeleton variant={skeletonVariant} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <PageSkeleton variant={skeletonVariant} />
      </div>
    );
  }

  return <>{children}</>;
}

export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    skeletonVariant?: 'dashboard' | 'table' | 'form' | 'profile';
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute 
        redirectTo={options?.redirectTo}
        skeletonVariant={options?.skeletonVariant}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
