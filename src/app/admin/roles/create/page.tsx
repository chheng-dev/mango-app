'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleForm } from '@/components/forms/RoleForm';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/lib/utils/toast';
import { PageLoading } from '@/components/ui/loading';
import { useCreateRole } from '@/hooks/useRoles';
import { usePermissionsListHook } from '@/hooks/usePermissionsData';

interface CreateRoleData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  permissions: number[];
}

export default function CreateRolePage() {
  const router = useRouter();
  
  const createRoleMutation = useCreateRole();
  
  const { 
    data: permissionsData, 
    isLoading: loading, 
    error: permissionsError 
  } = usePermissionsListHook({
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const permissions = permissionsData?.data || [];

  const handleSubmit = async (formData: CreateRoleData) => {
    try {
      const result = await createRoleMutation.mutateAsync(formData);
      
      if (result.success) {
        toast.success('Role created successfully!');
        router.push('/admin/roles');
      } else {
        throw new Error(result.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create role. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <PageLoading message="Loading permissions..." />
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-muted-foreground">Failed to load permissions</h2>
            <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
            <Button 
              onClick={() => router.push('/admin/roles')} 
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
      <div className="container max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/roles')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
          <p className="text-muted-foreground mt-2">
            Create a new role with specific permissions
          </p>
        </div>

        <RoleForm
          mode="create"
          permissions={permissions}
          onSubmit={handleSubmit}
          saving={createRoleMutation.isPending}
          onCancel={() => router.push('/admin/roles')}
        />
      </div>
    </div>
  );
}