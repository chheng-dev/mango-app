'use client';

import { useAuth } from '@/store/authStore';
import { ReactNode } from 'react';
import { LoadingScreen } from '@/components/layout/loading-screen';

interface OptimisticProtectedRouteProps {
  children: ReactNode;
}

/**
 * Optimistic Protected Route - Trusts middleware validation
 * 
 * Since the middleware already validates authentication server-side,
 * this component assumes the user is authorized if they reach this point.
 * It only shows a loading screen while auth state is being determined.
 */
export function OptimisticProtectedRoute({ children }: OptimisticProtectedRouteProps) {
  const { isLoading, isInitialized } = useAuth();

  // Show loading screen only while the initial auth check is happening
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Trust that middleware has already validated the user
  // If they reached this point, they're likely authenticated
  return <>{children}</>;
}

export default OptimisticProtectedRoute;
