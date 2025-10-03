'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { RoleForm, type RoleFormRef } from '@/components/forms/RoleForm';
import { PageHeader } from '@/components/share/page-header';
import { toast } from 'sonner';

export default function CreateRolePage() {
  const router = useRouter();
  const formRef = useRef<RoleFormRef>(null);

  const handleSuccess = (role: any) => {
    router.push('/admin/roles');
  };

  const handleCancel = () => {
    router.push('/admin/roles');
  };

  const handleBack = () => {
    router.back();
  };

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
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Create New Role"
        onBack={handleBack} 
        btnAction="Create"
        onAction={handleOnActionSubmit}
      />

      <div className="container mx-auto">
        <RoleForm
          ref={formRef}
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}