'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FormLayout } from '@/components/ui/form-layout';
import { UserForm, UserFormData } from '@/components/forms/UserForm';
import { useUsers } from '@/hooks/useUsers';
import { toast } from '@/lib/utils/toast';

export default function CreateUserPage() {
  const router = useRouter();
  const { createUser } = useUsers();

  const handleSubmit = useCallback(async (formData: UserFormData) => {
    try {
      const userData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        code: formData.code.trim().toUpperCase(),
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        dob: formData.dob || undefined,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      await createUser(userData);
      toast.success(`User "${formData.name}" has been created successfully`);
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user. Please try again.');
      throw error;
    }
  }, [createUser, router]);

  const breadcrumbs = [
    { label: 'Project', href: '/admin' },
    { label: 'User Create' }
  ];

  return (
    <FormLayout
      title="User Create"
      breadcrumbs={breadcrumbs}
      onBack={() => router.push('/admin/users')}
    >
      <UserForm
        mode="create"
        onSubmit={handleSubmit}
        className="space-y-8"
      />
    </FormLayout>
  );
}
