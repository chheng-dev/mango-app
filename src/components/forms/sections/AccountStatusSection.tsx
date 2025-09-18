"use client";

import { Switch } from "@/components/ui/switch";
import { FormSection, FormField, FormGrid } from "@/components/ui/form-layout";
import { UserFormData } from "./BasicInformationSection";

interface AccountStatusSectionProps {
  watchedValues: UserFormData;
  setValue: (name: keyof UserFormData, value: any) => void;
}

export function AccountStatusSection({
  watchedValues,
  setValue,
}: AccountStatusSectionProps) {
  return (
    <FormSection
      title="Account Status"
      description="Configure the user's account permissions and verification status"
    >
      <FormGrid columns={2}>
        <FormField
          label="Account Status"
          description="Enable or disable user access to the system"
        >
          <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
            <Switch
              checked={watchedValues.isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {watchedValues.isActive ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-muted-foreground">
                {watchedValues.isActive
                  ? "User can log in and access the system"
                  : "User cannot log in"}
              </p>
            </div>
          </div>
        </FormField>

        <FormField
          label="Verification Status"
          description="Mark if the user's email has been verified"
        >
          <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
            <Switch
              checked={watchedValues.isVerified}
              onCheckedChange={(checked) => setValue("isVerified", checked)}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {watchedValues.isVerified ? "Verified" : "Unverified"}
              </p>
              <p className="text-xs text-muted-foreground">
                {watchedValues.isVerified
                  ? "Email address has been verified"
                  : "Email verification pending"}
              </p>
            </div>
          </div>
        </FormField>
      </FormGrid>
    </FormSection>
  );
}
