'use client';

import { useState } from "react";
import { FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Eye, 
  EyeOff,
  AlertCircle,
  Lock
} from "lucide-react";
import { UserFormData } from "./BasicInformationSection";
import { cn } from "@/lib/utils";

interface SecuritySettingsSectionProps {
  mode: "create" | "edit";
  register: any;
  errors: FieldErrors<UserFormData>;
  formData: UserFormData;
}

export function SecuritySettingsSection({
  mode,
  register,
  errors,
  formData,
}: SecuritySettingsSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Security Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {mode === "edit"
            ? "Leave password fields empty to keep current password"
            : "Set up authentication credentials"}
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Password
            {mode === "create" && <span className="text-destructive text-lg">*</span>}
          </Label>
          <div className="relative group">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register('password')}
              placeholder="••••••••"
              className={cn(
                "transition-all duration-300 text-base h-12 pl-10 pr-12",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "group-hover:border-primary/50",
                errors.password && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-left duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{errors.password.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {mode === "create" 
              ? "Must be 8+ chars with uppercase, lowercase, and number"
              : "Enter new password to change (8+ chars, mixed case, number)"}
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="passwordConfirmation" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
            Confirm Password
            {(mode === "create" || !!formData.password) && <span className="text-destructive text-lg">*</span>}
          </Label>
          <div className="relative group">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="passwordConfirmation"
              type={showPasswordConfirm ? "text" : "password"}
              {...register('passwordConfirmation')}
              placeholder="••••••••"
              className={cn(
                "transition-all duration-300 text-base h-12 pl-10 pr-12",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "group-hover:border-primary/50",
                errors.passwordConfirmation && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            >
              {showPasswordConfirm ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.passwordConfirmation && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-right duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{errors.passwordConfirmation.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Re-enter the password to confirm it matches
          </p>
        </div>
      </div>
    </>
  );
}
