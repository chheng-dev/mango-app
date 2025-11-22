"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { PermissionForm, PermissionFormRef } from "../PermissionForm";
import { toast } from "sonner";
import { PageHeader } from "@/components/share/page-header";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission as PermissionType } from "@/lib/types/permission";

export default function EditPermissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permissionId = searchParams.get('id');
  const formRef = React.useRef<PermissionFormRef>(null);

  const { permissions } = usePermissions();

  const [permission, setPermission] = React.useState<PermissionType | null>(null);

  useEffect(() => {
    if (permissionId && permissions?.length > 0) {
      const foundPermission = permissions.find(p => p.id === parseInt(permissionId));
      if (foundPermission) {
        setPermission(foundPermission as PermissionType);
      } else {
        toast.error('Permission not found');
        router.push('/admin/permissions');
      }
    }
  }, [permissionId, permissions, router]);
  
  const handleOnActionSubmit = async () => {
    if (formRef.current) {
      const isFormValid = await formRef.current.triggerValidation();

      if (!isFormValid) {
        return;
      }

      if (!formRef.current.isDirty) {
        toast.info('No changes to save.');
        return;
      }

      formRef.current.submit();
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title={`Edit Permission: ${permission?.name || ''}`}
        onBack={() => router.push('/admin/permissions')} 
        btnAction="Update"
        onAction={handleOnActionSubmit}
      />
      <PermissionForm
        mode="edit"
        ref={formRef}
        permissionId={permission?.id}
        onSuccess={() => {
          toast.success('Permission updated successfully');
          router.push('/admin/permissions');
        }}
        onCancel={() => router.push('/admin/permissions')}
        onDelete={() => {}}
        deleteLoading={false}
      />
    </div>
  );
}
