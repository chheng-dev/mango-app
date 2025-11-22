"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

type User = {
  id: string;
  name: string;
  email: string;
  companyId?: number;
  permissions: Record<string, string[]> | string[];
  roles?: string[];
  isSuperAdmin?: boolean;
};

type UserContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  refetch: () => Promise<any>;
  error: unknown;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const {
    data: user,
    isLoading,
    refetch,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["user-context"],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: User;
        error?: string;
      }>("/profile");

      if (!res.success) {
        throw new Error(res.error || "Authentication failed");
      }
      return res.data;
    },
    retry: (failureCount, error) => {
      if (error?.message?.includes("Authentication") ||
          error?.message?.includes("No authentication token") ||
          error?.message?.includes("Authentication required")) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: typeof window !== 'undefined', // Only run on client side
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
  return (
    <UserContext.Provider value={{ user, isLoading, refetch, error }}>
      {children}
    </UserContext.Provider>
  );
};
