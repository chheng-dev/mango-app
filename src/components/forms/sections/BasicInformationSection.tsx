'use client';

import { FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  User, 
  Shield,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  formData: UserFormData;
  setValue: (name: keyof UserFormData, value: any) => void;
}

export function BasicInformationSection({
  register,
  errors,
  formData,
  setValue,
}: BasicInformationSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Full Name 
            <span className="text-destructive text-lg">*</span>
          </Label>
          <div className="relative group">
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., John Doe"
              className={cn(
                "transition-all duration-300 text-base h-12 pl-4 pr-12",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "group-hover:border-primary/50",
                errors.name && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
              )}
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {formData.name ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
              ) : (
                <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full"></div>
              )}
            </div>
          </div>
          {errors.name && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-left duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{errors.name.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Enter the user's full name (letters, spaces, hyphens, apostrophes only)
          </p>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="code" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
            User Code
            <span className="text-destructive text-lg">*</span>
          </Label>
          <div className="relative group">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="code"
              {...register("code", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.toUpperCase();
                }
              })}
              placeholder="USR001"
              className={cn(
                "transition-all duration-300 text-base h-12 pl-10 pr-12",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "group-hover:border-primary/50",
                errors.code && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
              )}
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {formData.code ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
              ) : (
                <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full"></div>
              )}
            </div>
          </div>
          {errors.code && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-right duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{errors.code.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Unique identifier (3-20 chars, uppercase letters, numbers, - and _ only)
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            Email Address
            <span className="text-destructive text-lg">*</span>
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
              className={cn(
                "transition-all duration-300 text-base h-12 pl-10 pr-12",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "group-hover:border-primary/50",
                errors.email && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
              )}
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {formData.email ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
              ) : (
                <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full"></div>
              )}
            </div>
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-left duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{errors.email.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            User's primary email address (must be valid format)
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="phoneNumber" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            Phone Number
          </Label>
          <div className="relative group">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phoneNumber"
              {...register('phoneNumber')}
              placeholder="+1 (555) 123-4567"
              className={cn(
                "transition-all duration-300 text-base h-12 pl-10 pr-12",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "group-hover:border-primary/50",
                errors.phoneNumber && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
              )}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {formData.phoneNumber ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
              ) : (
                <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full"></div>
              )}
            </div>
          </div>
          {errors.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-right duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{errors.phoneNumber.message}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Optional contact number (valid international format)
          </p>
        </div>
      </div>
    </>
  );
}
