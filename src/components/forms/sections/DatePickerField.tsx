"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { FormField } from "@/components/ui/form-layout";
import { FieldErrors } from "react-hook-form";
import { UserFormData } from "./BasicInformationSection";

interface DatePickerFieldProps {
  errors: FieldErrors<UserFormData>;
  watchedValues: UserFormData;
  setValue: (name: keyof UserFormData, value: any) => void;
}

export function DatePickerField({
  errors,
  watchedValues,
  setValue,
}: DatePickerFieldProps) {
  return (
    <FormField
      label="Date of Birth"
      error={errors.dob?.message}
      description="User's date of birth (optional)"
    >
      <div className="max-w-sm">
        <DatePicker
          value={watchedValues.dob ? new Date(watchedValues.dob) : undefined}
          onChange={(date) => setValue("dob", date ? date.toISOString().split("T")[0] : "")}
        />
      </div>
    </FormField>
  );
}
