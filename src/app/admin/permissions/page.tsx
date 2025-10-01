'use client';

import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Shield } from 'lucide-react';
import { usePermissionsPage } from '@/hooks/usePermissionsPage';
import { usePermissionsTableConfig } from '@/components/admin/permissions/PermissionsTableConfig';
import { HeaderComp } from '@/components/share/header-comp';

export default function PermissionsPage() {
  // Use the separated page logic hook
  const {
    permissions,
    loading,
    selectedPermission,
    isViewModalOpen,
    deleteLoading,
    handleCreatePermission,
    handleEditPermission,
    handleViewPermission,
    handleDeletePermission,
    handleCloseViewModal,
    handleEditFromView
  } = usePermissionsPage();

  // Use the separated table configuration
  const { columns } = usePermissionsTableConfig({
    onViewPermission: handleViewPermission,
    onEditPermission: handleEditPermission,
    onDeletePermission: handleDeletePermission,
    deleteLoading
  });

  return (
    <div className="space-y-6">
      <HeaderComp
        onAdd={handleCreatePermission}
        btnAdd="Add Permission"
        title="Permission Management"
        description="Manage permissions for roles and users"
      />
      
      <DataTable
        data={permissions}
        columns={columns}
        searchPlaceholder="Search permissions by name, resource, or action..."
        isLoading={loading}
      />

      {/* View Permission Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={handleCloseViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permission Details</DialogTitle>
            <DialogDescription>
              View permission information.
            </DialogDescription>
          </DialogHeader>
          {selectedPermission && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium">{selectedPermission.name}</p>
              </div>
              <div>
                <Label>Slug</Label>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {selectedPermission.slug}
                </code>
              </div>
              <div>
                <Label>Resource</Label>
                <Badge variant="outline" className="capitalize">
                  {selectedPermission.resource}
                </Badge>
              </div>
              <div>
                <Label>Action</Label>
                <Badge variant="outline" className="capitalize">
                  {selectedPermission.action}
                </Badge>
              </div>
              {selectedPermission.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedPermission.description}
                  </p>
                </div>
              )}
              <div>
                <Label>Created</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(selectedPermission.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Updated</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(selectedPermission.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseViewModal}>
              Close
            </Button>
            <Button onClick={handleEditFromView}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}