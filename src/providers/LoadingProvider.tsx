'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { GlobalLoading } from '@/components/ui/loading';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  setLoading: (loading: boolean, message?: string) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const setLoading = (loading: boolean, newMessage?: string) => {
    setIsLoading(loading);
    if (newMessage) {
      setMessage(newMessage);
    }
  };

  const showLoading = (newMessage?: string) => {
    setLoading(true, newMessage);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const value = {
    isLoading,
    message,
    setLoading,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <GlobalLoading message={message} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
