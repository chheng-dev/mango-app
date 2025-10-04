"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { AlertCircle, Calendar } from "lucide-react";
import { FieldErrors } from "react-hook-form";
import { UserFormData } from "./BasicInformationSection";

interface DatePickerFieldProps {
  errors: FieldErrors<UserFormData>;
  formData: UserFormData;
  setValue: (name: keyof UserFormData, value: any) => void;
}

export function DatePickerField({
  errors,
  formData,
  setValue,
}: DatePickerFieldProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="dob" className="text-sm font-semibold flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
        <Calendar className="h-4 w-4" />
        Date of Birth
      </Label>
      <div className="max-w-sm">
        <DatePicker
          value={formData.dob ? new Date(formData.dob) : undefined}
          onChange={(date) => setValue("dob", date ? date.toISOString().split("T")[0] : "")}
        />
      </div>
      {errors.dob && (
        <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-left duration-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="break-words">{errors.dob.message}</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        User's date of birth (optional, must be 13-120 years old)
      </p>
    </div>
  );
}
