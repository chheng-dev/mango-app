'use client';

import { use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm, UserFormRef } from '@/components/forms/UserForm';
import { useUsers } from '@/hooks/useUsers';
import { PageHeader } from '@/components/share/page-header';
import { toast } from 'sonner';

export default function CreateUserPage() {
  const router = useRouter();
  const formRef = useRef<UserFormRef>(null);
  const { createUser } = useUsers();

  // const handleSubmit = useCallback(async (formData: UserFormData) => {
  //   try {
  //     const userData: any = {
  //       name: formData.name.trim(),
  //       email: formData.email.trim().toLowerCase(),
  //       code: formData.code.trim().toUpperCase(),
  //       password: formData.password,
  //       passwordConfirmation: formData.passwordConfirmation,
  //       phoneNumber: formData.phoneNumber?.trim() || undefined,
  //       dob: formData.dob || undefined,
  //       isActive: formData.isActive,
  //       isVerified: formData.isVerified,
  //     };

  //     await createUser(userData);
  //     toast.success(`User "${formData.name}" has been created successfully`);
  //     router.push('/admin/users');
  //   } catch (error) {
  //     console.error('Failed to create user:', error);
  //     toast.error('Failed to create user. Please try again.');
  //     throw error;
  //   }
  // }, [createUser, router]);

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
