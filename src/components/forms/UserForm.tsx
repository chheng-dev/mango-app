"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import {
  BasicInformationSection,
  DatePickerField,
  SecuritySettingsSection,
  AccountStatusSection,
  FormActionsSection,
  UserFormData as BaseUserFormData,
} from "./sections";

// Zod schema for user form validation
const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  code: z.string().min(1, "Code is required").min(3, "Code must be at least 3 characters"),
  password: z.string().optional(),
  passwordConfirmation: z.string().optional(),
  phoneNumber: z.string().optional(),
  dob: z.string().optional(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    if (data.password.length < 6) {
      return false;
    }
    if (data.password !== data.passwordConfirmation) {
      return false;
    }
  }
  return true;
}, {
  message: "Password must be at least 6 characters and passwords must match",
  path: ["passwordConfirmation"],
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  loading?: boolean; 
  deleteLoading?: boolean;
  className?: string;
}

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onDelete,
  isLoading = false,
  loading = false,
  deleteLoading = false,
  className,
}: UserFormProps) {
  // Create a dynamic schema based on mode
  const createFormSchema = () => {
    if (mode === "create") {
      return userFormSchema.refine((data) => {
        if (!data.password || data.password.length < 6) {
          return false;
        }
        if (data.password !== data.passwordConfirmation) {
          return false;
        }
        return true;
      }, {
        message: "Password is required and must be at least 6 characters, passwords must match",
        path: ["password"],
      });
    }
    return userFormSchema;
  };

  const form = useForm<UserFormData>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      code: initialData?.code || "",
      password: "",
      passwordConfirmation: "",
      phoneNumber: initialData?.phoneNumber || "",
      dob: initialData?.dob || "",
      isActive: initialData?.isActive ?? true,
      isVerified: initialData?.isVerified ?? false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  const watchedValues = watch();

  const onSubmitForm = async (data: UserFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className={cn("space-y-8", className)}>
      {/* Basic Information Section */}
      <BasicInformationSection
        register={register}
        errors={errors}
        watchedValues={watchedValues}
        setValue={setValue}
      />

      {/* Date Picker Field */}
      <DatePickerField
        errors={errors}
        watchedValues={watchedValues}
        setValue={setValue}
      />

      {/* Security Settings Section */}
      <SecuritySettingsSection
        mode={mode}
        register={register}
        errors={errors}
        watchedValues={watchedValues}
      />

      {/* Account Status Section */}
      <AccountStatusSection
        watchedValues={watchedValues}
        setValue={setValue}
      />

      {/* Form Actions */}
      <FormActionsSection
        mode={mode}
        onDelete={onDelete}
        isLoading={isLoading}
        loading={loading}
        deleteLoading={deleteLoading}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}