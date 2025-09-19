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
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const loginApi = async (credentials: { email: string; password: string }) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isCheckingAuth, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMeApi,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (data.success) {
        const { user } = data.data;

        const mappedUser: User = {
          id: user.id || user.userId, 
          email: user.email,
          name: user.name || user.email,
          code: user.code,
          isVerified: user.isVerified
        };
        
        setUser(mappedUser);
        setIsAuthenticated(true);
        
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);      
      queryClient.clear();
    },
  });

  useEffect(() => {    
    if (userData?.success) {
      const userFromJWT = userData.data;
      const mappedUser: User = {
        id: userFromJWT.userId || userFromJWT.id, 
        email: userFromJWT.email,
        name: userFromJWT.name || userFromJWT.email,
        code: userFromJWT.code,
        isVerified: userFromJWT.isVerified
      };
      
      console.log('🔄 Mapped user data:', mappedUser);
      setUser(mappedUser);
      setIsAuthenticated(true);
      setIsInitialized(true);
    } else if (error || (userData && !userData.success)) {
      setUser(null);
      setIsAuthenticated(false);
      setIsInitialized(true);
      
    } else if (!isCheckingAuth && !userData) {
      setIsInitialized(true);
    }
  }, [userData, error, isCheckingAuth]);

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
    isInitialized,
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
