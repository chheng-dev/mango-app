'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { FormLayout } from '@/components/ui/form-layout';
import { UserForm, UserFormData } from '@/components/forms/UserForm';
import { useUsers } from '@/hooks/useUsers';
import { User as UserType } from '@/lib/api/userApiService';
import { toast } from '@/lib/utils/toast';

function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  const { users, updateUser, deleteUser } = useUsers();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (userId && users.length > 0) {
      const foundUser = users.find(u => u.id === parseInt(userId));
      if (foundUser) {
        setUser(foundUser);
      } else {
        toast.error('User not found');
        router.push('/admin/users');
      }
    }
  }, [userId, users, router]);

  const handleSubmit = useCallback(async (formData: UserFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        code: formData.code.trim().toUpperCase(),
        phoneNumber: formData.phoneNumber?.trim() || null,
        dob: formData.dob || null,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      // Only include password if it was changed
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
        updateData.passwordConfirmation = formData.passwordConfirmation;
      }

      await updateUser(user.id, updateData);
      toast.success(`User "${formData.name}" has been updated successfully`);
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user. Please try again.');
      throw error; // Re-throw to let the form handle loading state
    } finally {
      setLoading(false);
    }
  }, [user, updateUser, router]);

  const handleDelete = useCallback(async () => {
    if (!user) return;

    const confirmMessage = `Delete User: ${user.name}

This action cannot be undone. Are you sure you want to delete this user?

User Details:
• Email: ${user.email}
• Code: ${user.code}
• Status: ${user.isActive ? 'Active' : 'Inactive'}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteUser(user.id);
      toast.success(`User "${user.name}" has been deleted successfully`);
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }, [user, deleteUser, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Project', href: '/admin' },
    { label: 'User Edit' }
  ];

  return (
    <FormLayout
      title="User Edit"
      breadcrumbs={breadcrumbs}
      onBack={() => router.push('/admin/users')}
    >
      <div className="p-8 space-y-8">
        <UserForm
          mode="edit"
          initialData={{
            name: user.name,
            email: user.email,
            code: user.code,
            phoneNumber: user.phoneNumber || undefined,
            dob: user.dob ? user.dob.toISOString().split('T')[0] : undefined,
            isActive: user.isActive,
            isVerified: user.isVerified,
          }}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          loading={loading}
          deleteLoading={deleteLoading}
          className="space-y-8"
        />
      </div>
    </FormLayout>
  );
}

export default function EditUserPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading2...</p>
        </div>
      </div>
    }>
      <EditUserContent />
    </Suspense>
  );
}