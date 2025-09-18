"use client";

import { useState } from "react";
import { FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-layout";
import { Shield, Eye, EyeOff } from "lucide-react";
import { UserFormData } from "./BasicInformationSection";

interface SecuritySettingsSectionProps {
  mode: "create" | "edit";
  register: any;
  errors: FieldErrors<UserFormData>;
  watchedValues: UserFormData;
}

export function SecuritySettingsSection({
  mode,
  register,
  errors,
  watchedValues,
}: SecuritySettingsSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <FormSection
      title="Security Settings"
      description={
        mode === "edit"
          ? "Leave password fields empty to keep current password"
          : "Set up authentication credentials"
      }
    >
      <FormGrid columns={2}>
        <FormField
          label="Password"
          required={mode === "create"}
          error={errors.password?.message}
          description={
            mode === "create"
              ? "Choose a strong password"
              : "Enter new password to change"
          }
        >
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className="pl-10 pr-10"
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
        </FormField>

        <FormField
          label="Confirm Password"
          required={mode === "create" || !!watchedValues.password}
          error={errors.passwordConfirmation?.message}
          description="Re-enter the password to confirm"
        >
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="••••••••"
              {...register("passwordConfirmation")}
              className="pl-10 pr-10"
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
        </FormField>
      </FormGrid>
    </FormSection>
  );
}
