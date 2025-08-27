'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  email: string;
  name: string;
  code: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API functions
const loginApi = async (credentials: { email: string; password: string }) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
};

const getMeApi = async () => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
};

const logoutApi = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return response.json();
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  // Check authentication status
  const { data: userData, isLoading: isCheckingAuth, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMeApi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (data.success) {
        const { user, token } = data.data;
        
        // Set cookie
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
        
        setUser(user);
        setIsAuthenticated(true);
        
        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear all queries
      queryClient.clear();
    },
  });

  // Update auth state when user data changes
  useEffect(() => {
    if (userData?.success) {
      setUser(userData.data);
      setIsAuthenticated(true);
    } else if (error || (userData && !userData.success)) {
      // Clear auth state if there's an error or unsuccessful response
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear cookie if auth failed
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, [userData, error]);

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const checkAuth = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isCheckingAuth || loginMutation.isPending || logoutMutation.isPending,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
