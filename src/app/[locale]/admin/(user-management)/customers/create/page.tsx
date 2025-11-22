"use client"
import { PageHeader } from "@/components/share/page-header";
import { useRouter } from "next/navigation";
import { CustomerForm, CustomerFormRef } from "../form";
import { useRef } from "react";
import { toast } from "sonner";

export default function CreateCustomerPage() {
  const router = useRouter();
  const formRef = useRef<CustomerFormRef>(null);

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
        title="Create Customer"
        onBack={() => router.back()}
        btnAction="Save Changes"
        onAction={handleOnActionSubmit}
      />
      <CustomerForm
        ref={formRef}
        mode="create"
        onSuccess={() => router.push('/admin/user-management/customers')}
        onCancel={() => router.push('/admin/user-management/customers')}
      />
    </div>
  );
} 