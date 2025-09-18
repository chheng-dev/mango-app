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
  console.log('🔐 Calling login API with:', { email: credentials.email });
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: include cookies
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    console.error('❌ Login API failed:', response.status, response.statusText);
    throw new Error('Login failed');
  }

  const result = await response.json();
  console.log('📊 Login API response:', result);
  return result;
};

const getMeApi = async () => {
  console.log('👤 Calling /api/auth/me...');
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  console.log('📊 /api/auth/me response status:', response.status);
  
  if (!response.ok) {
    console.error('❌ /api/auth/me failed:', response.status, response.statusText);
    throw new Error('Failed to get user');
  }

  const result = await response.json();
  console.log('📊 /api/auth/me response data:', result);
  return result;
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
      console.log('🚪 Login API response:', data);
      if (data.success) {
        const { user } = data.data;
        console.log('✅ Setting user data from login:', user);
        
        // The login response should have the full user object with 'id'
        // But just in case, let's ensure the mapping is correct
        const mappedUser: User = {
          id: user.id || user.userId, // Handle both field names
          email: user.email,
          name: user.name || user.email, // Fallback if name not available
          code: user.code,
          isVerified: user.isVerified
        };
        
        console.log('🔄 Mapped user data from login:', mappedUser);
        
        // Don't set client-side cookie - rely on HTTP-only cookie from server
        // The server already set the auth-token cookie in the login response
        
        setUser(mappedUser);
        setIsAuthenticated(true);
        
        // Invalidate auth queries to trigger /api/auth/me call
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
      // Don't manually clear cookie - server should handle this
      // The logout API should clear the HTTP-only cookie
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear all queries
      queryClient.clear();
    },
  });

  // Update auth state when user data changes
  useEffect(() => {
    console.log('📊 Auth state update:', { userData, error, isCheckingAuth });
    
    if (userData?.success) {
      console.log('✅ Setting user from /api/auth/me:', userData.data);
      
      // Map JWT payload fields to User interface
      // JWT has 'userId' but User interface expects 'id'
      const userFromJWT = userData.data;
      const mappedUser: User = {
        id: userFromJWT.userId || userFromJWT.id, // Handle both field names
        email: userFromJWT.email,
        name: userFromJWT.name || userFromJWT.email, // Fallback if name not in JWT
        code: userFromJWT.code,
        isVerified: userFromJWT.isVerified
      };
      
      console.log('🔄 Mapped user data:', mappedUser);
      setUser(mappedUser);
      setIsAuthenticated(true);
    } else if (error || (userData && !userData.success)) {
      console.log('❌ Clearing auth state:', { error, userData });
      // Clear auth state if there's an error or unsuccessful response
      setUser(null);
      setIsAuthenticated(false);
      
      // Don't manually clear cookie - let server handle HTTP-only cookies
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
