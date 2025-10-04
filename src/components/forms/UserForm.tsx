'use client';

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useUserFormWithQuery } from "@/hooks/useUserFormWithQuery";

interface UserFormProps {
  userId?: string | number;
  mode: 'create' | 'edit';
  onSuccess?: (user: any) => void;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  loading?: boolean; 
  deleteLoading?: boolean;
  className?: string;
}

export interface UserFormRef {
  submit: () => void;
  triggerValidation: () => Promise<boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export const UserForm = forwardRef<UserFormRef, UserFormProps>(({
  userId,
  mode,
  onSuccess,
  onCancel,
  onDelete,
  isLoading = false,
  loading = false,
  deleteLoading = false,
  className,
}, ref) => {

  // All hooks must be called before any conditional returns
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    handleSubmit,
    isSubmitting,
    isValid,
    isDirty,
    isLoadingUser,
    form,
  } = useUserFormWithQuery({ 
    userId, 
    mode, 
    onSuccess,
    onError: (error) => console.error('User form error:', error)
  });

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit();
    },
    triggerValidation: async () => {
      return await form.trigger();
    },
    isValid,
    isDirty,
    isSubmitting,
  }), [handleSubmit, form, isValid, isDirty, isSubmitting]);

  if (isLoadingUser) {
    return (
      <div className="w-full mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Enter the user's full name</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>User Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="USR001"
                      className="uppercase"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Unique identifier for the user</FormDescription>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>User's primary email address</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Optional contact number</FormDescription>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="dob"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    dateLabel="Date of Birth"
                    placeholder="Select date of birth"
                    isRequired={false}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>User's date of birth (optional)</FormDescription>
              </FormItem>
            )}
          />

          <Separator className="my-6" />

          {/* Security Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Password 
                    {mode === "create" && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    {mode === "create" 
                      ? "Must be 8+ chars with uppercase, lowercase, and number"
                      : "Enter new password to change"}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password
                    {mode === "create" && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Re-enter the password to confirm</FormDescription>
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6" />

          {/* Account Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Status</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <span className="font-medium text-sm">
                          {field.value ? 'Active' : 'Inactive'}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {field.value
                            ? "User can log in and access the system"
                            : "User cannot log in"}
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVerified"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Status</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <span className="font-medium text-sm">
                          {field.value ? 'Verified' : 'Unverified'}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {field.value
                            ? "Email address has been verified"
                            : "Email verification pending"}
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6" />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                mode === 'edit' ? 'Update User' : 'Create User'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
});

UserForm.displayName = "UserForm";