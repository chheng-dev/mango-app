"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@/providers/user-provider";

// Query keys
const USER_QUERY_KEY = ["user", "profile"] as const;
const USERS_QUERY_KEY = ["users"] as const;

// Types
type UpdateUserData = {
  name?: string;
  email?: string;
};

type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

// Custom hook for user operations
export const useUserOperations = () => {
  const queryClient = useQueryClient();
  const { user, invalidateUser } = useUser();

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await apiClient.put<{
        success: boolean;
        data: any;
        message: string;
      }>(`/users/${user?.id}`, data);

      if (!response.success) {
        throw new Error(response.message || "Failed to update profile");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/auth/change-password", data);

      if (!response.success) {
        throw new Error(response.message || "Failed to change password");
      }

      return response;
    },
    onSuccess: () => {
      console.log("Password changed successfully");
    },
    onError: (error) => {
      console.error("Password change failed:", error);
    },
  });

  // Logout mutation (using the context logout)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // This would be handled by the UserProvider's logout
      // But we can add additional cleanup here if needed
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all user-related queries
      queryClient.removeQueries({ queryKey: USER_QUERY_KEY });
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  return {
    // Profile operations
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,

    // Password operations
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,

    // Logout operations
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    // Utility functions
    invalidateUser,
  };
};

// Hook for managing multiple users (admin operations)
export const useUsers = () => {
  const queryClient = useQueryClient();

  // Get all users
  const getUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>("/users");

      if (!response.success) {
        throw new Error("Failed to fetch users");
      }

      return response.data;
    },
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await apiClient.post<{
        success: boolean;
        data: any;
      }>("/users", data);

      if (!response.success) {
        throw new Error("Failed to create user");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  // Update user
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await apiClient.put<{
        success: boolean;
        data: any;
      }>(`/users/${id}`, data);

      if (!response.success) {
        throw new Error("Failed to update user");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/users/${id}`);

      if (!response.success) {
        throw new Error("Failed to delete user");
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });

  return {
    // Query operations
    getUsers: getUsersMutation.mutateAsync,
    isLoadingUsers: getUsersMutation.isPending,

    // Mutation operations
    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,

    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    deleteUser: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,

    // Error states
    errors: {
      getUsers: getUsersMutation.error,
      createUser: createUserMutation.error,
      updateUser: updateUserMutation.error,
      deleteUser: deleteUserMutation.error,
    },
  };
};
