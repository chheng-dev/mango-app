"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, CheckCircle2, XCircle } from "lucide-react";
import { UserFormData } from "./BasicInformationSection";

interface AccountStatusSectionProps {
  formData: UserFormData;
  setValue: (name: keyof UserFormData, value: any) => void;
}

export function AccountStatusSection({
  formData,
  setValue,
}: AccountStatusSectionProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Account Status</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure the user's account permissions and verification status
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="isActive" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Account Status
          </Label>
          <div className="flex items-center space-x-3 p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors duration-200">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <div className="flex-1 flex items-center gap-2">
              {formData.isActive ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {formData.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.isActive
                    ? "User can log in and access the system"
                    : "User cannot log in"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="isVerified" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            Verification Status
          </Label>
          <div className="flex items-center space-x-3 p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors duration-200">
            <Switch
              id="isVerified"
              checked={formData.isVerified}
              onCheckedChange={(checked) => setValue("isVerified", checked)}
            />
            <div className="flex-1 flex items-center gap-2">
              {formData.isVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {formData.isVerified ? "Verified" : "Unverified"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.isVerified
                    ? "Email address has been verified"
                    : "Email verification pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
