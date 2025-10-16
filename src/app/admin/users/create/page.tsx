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
      
      // Trigger validation
      const isFormValid = await formRef.current.triggerValidation();
      
      if (!isFormValid) {
        toast.error('Please fix the validation errors before submitting.');
        return;
      }
      
      // Submit the form
      formRef.current.submit();
    }
  }

  return (
    <div className='h-screen bg-background'>
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
