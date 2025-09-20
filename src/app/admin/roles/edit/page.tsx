'use client';

import { Button } from '@/components/ui/button';
import { RoleForm } from '@/components/forms/RoleForm';
import { PageLoading } from '@/components/ui/loading';
import { useEditRolePage } from '@/hooks/useEditRolePage';
import { EditRolePageHeader } from '@/components/admin/roles/EditRolePageHeader';

export default function EditRolePage() {
  const {
    role,
    permissions,
    loading,
    saving,
    roleError,
    permissionsError,
    initialData,
    handleSubmit,
    handleCancel,
    handleBack
  } = useEditRolePage();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <PageLoading message="Loading role details..." />
        </div>
      </div>
    );
  }

  if (roleError || permissionsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-muted-foreground">
              {roleError ? 'Role not found' : 'Failed to load permissions'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {roleError ? 'The role you\'re looking for doesn\'t exist' : 'Please try refreshing the page'}
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

  if (!role) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-muted-foreground">Role not found</h2>
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
      <div className="container max-w-6xl mx-auto p-6">
        <EditRolePageHeader onBack={handleBack} />

        {initialData && (
          <RoleForm
            mode="edit"
            initialData={initialData}
            permissions={permissions}
            onSubmit={handleSubmit}
            saving={saving}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
