"use client";

import { FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-layout";
import { Mail, Phone, User, Shield } from "lucide-react";

export interface UserFormData {
  name: string;
  email: string;
  code: string;
  password?: string;
  passwordConfirmation?: string;
  phoneNumber?: string;
  dob?: string;
  isActive: boolean;
  isVerified: boolean;
}

interface BasicInformationSectionProps {
  register: any;
  errors: FieldErrors<UserFormData>;
  watchedValues: UserFormData;
  setValue: (name: keyof UserFormData, value: any) => void;
}

export function BasicInformationSection({
  register,
  errors,
  watchedValues,
  setValue,
}: BasicInformationSectionProps) {
  return (
    <FormSection
      title="Basic Information"
      description="Enter the basic details for the user account"
    >
      <FormGrid columns={2}>
        <FormField
          label="Full Name"
          required
          error={errors.name?.message}
          description="Enter the user's full name"
        >
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="John Doe"
              {...register("name")}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField
          label="User Code"
          required
          error={errors.code?.message}
          description="Unique identifier for the user"
        >
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="USR001"
              {...register("code", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.toUpperCase();
                }
              })}
              className="pl-10"
            />
          </div>
        </FormField>
      </FormGrid>

      <FormGrid columns={2}>
        <FormField
          label="Email Address"
          required
          error={errors.email?.message}
          description="User's primary email address"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField
          label="Phone Number"
          error={errors.phoneNumber?.message}
          description="Optional contact number"
        >
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="+1 (555) 123-4567"
              {...register("phoneNumber")}
              className="pl-10"
            />
          </div>
        </FormField>
      </FormGrid>
    </FormSection>
  );
}
