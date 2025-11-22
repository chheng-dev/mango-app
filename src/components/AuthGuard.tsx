"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo,
  fallback
}: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Still loading, don't redirect yet

    const isAuthenticated = !!user;

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      const loginUrl = redirectTo || `/en/login`;
      console.log(`AuthGuard: User not authenticated, redirecting to ${loginUrl}`);
      router.push(loginUrl);
    }
  }, [user, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication check is complete, render children
  return <>{children}</>;
}

// Hook for imperative auth checking with redirect
export function useAuthRedirect() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const requireAuth = (redirectTo?: string) => {
    if (isLoading) return false; // Still checking

    if (!user) {
      const loginUrl = redirectTo || '/en/login';
      console.log(`useAuthRedirect: Authentication required, redirecting to ${loginUrl}`);
      router.push(loginUrl);
      return false;
    }

    return true; // User is authenticated
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    requireAuth,
  };
}
