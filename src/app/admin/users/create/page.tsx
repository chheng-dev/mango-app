'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm, UserFormRef } from '@/components/forms/UserForm';
import { PageHeader } from '@/components/share/page-header';
import { toast } from 'sonner';

export default function CreateUserPage() {
  const router = useRouter();
  const formRef = useRef<UserFormRef>(null);

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
    <div className='min-h-screen bg-background'>
      <PageHeader 
        title="Create New User"
        onBack={() => router.push('/admin/users')} 
        btnAction="Create"
        onAction={handleOnActionSubmit}
      />
      <UserForm
        ref={formRef}
        mode="create"
        onSuccess={() => router.push('/admin/users')}
        onCancel={() => router.push('/admin/users')}
      />
    </div>
  );
}
