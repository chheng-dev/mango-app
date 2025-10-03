'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { UserForm, UserFormRef } from '@/components/forms/UserForm';
import { useUsers } from '@/hooks/useUsers';
import { User as UserType } from '@/lib/api/userApiService';
import { PageHeader } from '@/components/share/page-header';
import { toast } from 'sonner';

function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const formRef = useRef<UserFormRef>(null);
  
  const { users, deleteUser } = useUsers();
  
  const [user, setUser] = useState<UserType | null>(null);
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

  return (
    <div className='min-h-screen bg-background'>
      <PageHeader 
        title={`Edit User: ${user.name}`}
        onBack={() => router.push('/admin/users')} 
        btnAction="Update User"
        onAction={handleOnActionSubmit}
      />
      <UserForm
        ref={formRef}
        userId={user.id}
        mode="edit"
        onSuccess={(updatedUser) => {
          toast.success(`User "${updatedUser.name}" has been updated successfully`);
          router.push('/admin/users');
        }}
        onCancel={() => router.push('/admin/users')}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
      />
    </div>
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