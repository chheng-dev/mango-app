"use client";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/share/page-header";
import { PermissionForm } from "../PermissionForm";
import React from "react";

export default function CreatePermissionPage() {
  const router = useRouter();
  const formRef = React.useRef<any>(null);

  const handleOnActionSubmit = async () => {
    if (formRef.current) {
      const isFormValid = await formRef.current.triggerValidation();
      
      if (!isFormValid) {
        return;
      }
      
      if (!formRef.current.isDirty) {
        return;
      }

      formRef.current.submit();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Create New Permission"
        onBack={() => router.push('/admin/permissions')} 
        btnAction="Create"
        onAction={handleOnActionSubmit}
      />
      <PermissionForm
        ref={formRef}
        mode="create"
        onSuccess={() => router.push('/admin/permissions')}
        onCancel={() => router.push('/admin/permissions')}
      />
    </div>
  );
}