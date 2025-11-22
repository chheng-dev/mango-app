'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RoleForm, type RoleFormRef } from '@/components/forms/RoleForm';
import { PageHeader } from '@/components/share/page-header';
import { toast } from 'sonner';

export default function EditRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<RoleFormRef>(null);
  
  const roleId = searchParams.get('id');

  const handleSuccess = (role: any) => {
    console.log('Role updated successfully:', role);
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

  if (!roleId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Invalid Role ID
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Please provide a valid role ID to edit.
            </p>
            <Button 
              onClick={handleBack} 
              variant="outline" 
              className="mt-4"
            >
              Back to Roles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Edit Role"
        onBack={handleBack} 
        btnAction="Update"
        onAction={handleOnActionSubmit}
      />

      <RoleForm
        ref={formRef}
        roleId={roleId}
        mode="edit"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
