"use client";

import { ContactPersonForm, ContactPersonFormRef } from "@/components/forms/ContactPersonForm";
import { PageHeader } from "@/components/share/page-header";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

export default function EditContactPersonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<ContactPersonFormRef>(null);
  const cpCode = searchParams.get('cpCode') as string;

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
        title="Edit Contact Person"
        onBack={() => router.push('/admin/contact-persons')}
        btnAction="Update Contact Person"
        onAction={handleOnActionSubmit}
      />
      <ContactPersonForm
        ref={formRef}
        mode="edit"
        cpCode={cpCode}
        onSuccess={() => router.push('/admin/contact-persons')}
        onCancel={() => router.push('/admin/contact-persons')}
      />
    </div>
  )
}