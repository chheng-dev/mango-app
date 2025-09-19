import React, { useState } from 'react';
import { useRoleWithPermissions, useAssignPermissions, useRemovePermissions } from '@/hooks/useRoles';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Minus, Save } from 'lucide-react';

interface RolePermissionsManagerProps {
  roleId: number;
  onClose?: () => void;
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
  resource: string;
  action: string;
}

export function RolePermissionsManager({ roleId, onClose }: RolePermissionsManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [mode, setMode] = useState<'assign' | 'remove'>('assign');

  // Fetch role with current permissions
  const { 
    data: roleWithPermissions, 
    isLoading: roleLoading, 
    error: roleError 
  } = useRoleWithPermissions(roleId);

  // Fetch all available permissions
  const { 
    data: allPermissions, 
    isLoading: permissionsLoading 
  } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/rbac/permissions?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
  });

  // Mutations
  const assignPermissionsMutation = useAssignPermissions();
  const removePermissionsMutation = useRemovePermissions();

  const currentPermissions = roleWithPermissions?.data?.permissions || [];
  const currentPermissionIds = currentPermissions.map(p => p.id);
  
  const availablePermissions = allPermissions?.data || [];
  const unassignedPermissions = availablePermissions.filter(
    (p: Permission) => !currentPermissionIds.includes(p.id)
  );

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleAssignPermissions = async () => {
    if (selectedPermissions.length === 0) return;

    try {
      await assignPermissionsMutation.mutateAsync({
        roleId,
        permissionIds: selectedPermissions
      });
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Failed to assign permissions:', error);
    }
  };

  const handleRemovePermissions = async () => {
    if (selectedPermissions.length === 0) return;

    try {
      await removePermissionsMutation.mutateAsync({
        roleId,
        permissionIds: selectedPermissions
      });
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Failed to remove permissions:', error);
    }
  };

  const handleSubmit = () => {
    if (mode === 'assign') {
      handleAssignPermissions();
    } else {
      handleRemovePermissions();
    }
  };

  if (roleLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading permissions...
      </div>
    );
  }

  if (roleError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load role permissions. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const isLoading = assignPermissionsMutation.isPending || removePermissionsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Role Permissions</h2>
          <p className="text-muted-foreground">
            Role: {roleWithPermissions?.data?.name}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex space-x-2">
        <Button
          variant={mode === 'assign' ? 'default' : 'outline'}
          onClick={() => {
            setMode('assign');
            setSelectedPermissions([]);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Permissions
        </Button>
        <Button
          variant={mode === 'remove' ? 'default' : 'outline'}
          onClick={() => {
            setMode('remove');
            setSelectedPermissions([]);
          }}
        >
          <Minus className="h-4 w-4 mr-2" />
          Remove Permissions
        </Button>
      </div>

      {/* Current Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Permissions ({currentPermissions.length})</CardTitle>
          <CardDescription>
            Permissions currently assigned to this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPermissions.length === 0 ? (
            <p className="text-muted-foreground">No permissions assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentPermissions.map((permission: Permission) => (
                <Badge 
                  key={permission.id} 
                  variant={mode === 'remove' && selectedPermissions.includes(permission.id) ? 'destructive' : 'secondary'}
                  className={mode === 'remove' ? 'cursor-pointer' : ''}
                  onClick={() => mode === 'remove' && handlePermissionToggle(permission.id)}
                >
                  {permission.name}
                  {mode === 'remove' && selectedPermissions.includes(permission.id) && (
                    <Minus className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Permissions (Assign Mode) */}
      {mode === 'assign' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Permissions ({unassignedPermissions.length})</CardTitle>
            <CardDescription>
              Select permissions to assign to this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unassignedPermissions.length === 0 ? (
              <p className="text-muted-foreground">All permissions are already assigned</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {unassignedPermissions.map((permission: Permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <label
                      htmlFor={`permission-${permission.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{permission.name}</div>
                      {permission.description && (
                        <div className="text-sm text-muted-foreground">
                          {permission.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {permission.resource} • {permission.action}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedPermissions.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
          <div>
            <p className="font-medium">
              {selectedPermissions.length} permission(s) selected
            </p>
            <p className="text-sm text-muted-foreground">
              {mode === 'assign' ? 'Ready to assign' : 'Ready to remove'}
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant={mode === 'remove' ? 'destructive' : 'default'}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {mode === 'assign' ? 'Assign Permissions' : 'Remove Permissions'}
          </Button>
        </div>
      )}

      {/* Success/Error Messages */}
      {assignPermissionsMutation.isSuccess && (
        <Alert>
          <AlertDescription>
            Permissions assigned successfully!
          </AlertDescription>
        </Alert>
      )}
      
      {removePermissionsMutation.isSuccess && (
        <Alert>
          <AlertDescription>
            Permissions removed successfully!
          </AlertDescription>
        </Alert>
      )}
      
      {(assignPermissionsMutation.isError || removePermissionsMutation.isError) && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to update permissions. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default RolePermissionsManager;
