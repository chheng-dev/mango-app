"use client";
import { ContactPersonForm, ContactPersonFormRef } from "@/components/forms/ContactPersonForm";
import { PageHeader } from "@/components/share/page-header";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

export default function CreateContactPersonPage() {
  const router = useRouter();
  const formRef = useRef<ContactPersonFormRef>(null);

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
    <div className="h-screen bg-background">
      <PageHeader
        title="Create Contact Person"
        onBack={() => router.push('/admin/user-management/contact-persons')}
        btnAction="Create"
        onAction={handleOnActionSubmit}
      />
      <ContactPersonForm 
        ref={formRef}
        mode="create"
        onSuccess={() => router.push('/admin/user-management/contact-persons')}
        onCancel={() => router.push('/admin/user-management/contact-persons')}
      />
    </div>
  )
}