"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { 
  useUpdatePermission,
  usePermissionResources 
} from '@/hooks/usePermissionsData';
import { Permission, UpdatePermissionData } from '@/lib/api/permissionApiService';
import { toast } from '@/lib/utils/toast';
import { permissionApiService } from '@/lib/api/permissionApiService';

interface PermissionFormData {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export default function EditPermissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permissionId = searchParams.get('id');
  
  // State
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    resource: '',
    action: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<PermissionFormData>>({});

  // API hooks
  const { data: resourcesData } = usePermissionResources();
  const updateMutation = useUpdatePermission(permissionId ? parseInt(permissionId) : 0);

  const resources = resourcesData?.data || [];

  // Load permission data
  useEffect(() => {
    async function loadPermission() {
      if (!permissionId) {
        router.push('/admin/permissions');
        return;
      }

      try {
        setLoading(true);
        const response = await permissionApiService.getPermissionById(parseInt(permissionId));
        if (response.success && response.data) {
          const perm = response.data;
          setPermission(perm);
          setFormData({
            name: perm.name,
            resource: perm.resource,
            action: perm.action,
            description: perm.description || ''
          });
        } else {
          toast.error('Permission not found');
          router.push('/admin/permissions');
        }
      } catch (error) {
        console.error('Error loading permission:', error);
        toast.error('Failed to load permission');
        router.push('/admin/permissions');
      } finally {
        setLoading(false);
      }
    }

    loadPermission();
  }, [permissionId, router]);

  // Event handlers
  function validateForm(): boolean {
    const errors: Partial<PermissionFormData> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.resource.trim()) {
      errors.resource = 'Resource is required';
    }
    
    if (!formData.action.trim()) {
      errors.action = 'Action is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm() || !permission) return;

    const updateData: UpdatePermissionData = {
      name: formData.name.trim(),
      resource: formData.resource.trim(),
      action: formData.action.trim(),
      description: formData.description.trim() || undefined
    };

    try {
      await updateMutation.mutateAsync(updateData);
      toast.success('Permission updated successfully');
      router.push('/admin/permissions');
    } catch (error) {
      console.error('Update permission error:', error);
      toast.error('Failed to update permission');
    }
  }

  function handleCancel() {
    router.push('/admin/permissions');
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/permissions')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Permissions
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Loader2 className="h-5 w-5 text-slate-700 dark:text-slate-300 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Loading Permission...
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please wait while we load the permission details
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!permission) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Custom Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/permissions')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Permissions
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Save className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Edit Permission
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update permission details and settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Permission Details
            </CardTitle>
            <CardDescription>
              Update the details for this permission. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Permission Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Read Users, Manage Roles"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  A human-readable name for the permission
                </p>
              </div>

              <div>
                <Label htmlFor="resource" className="text-sm font-medium">
                  Resource *
                </Label>
                <div className="space-y-2">
                  <Select value={formData.resource} onValueChange={(value) => setFormData(prev => ({ ...prev, resource: value }))}>
                    <SelectTrigger className={formErrors.resource ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a resource or type a new one" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource} value={resource} className="capitalize">
                          {resource}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type a custom resource..."
                    value={formData.resource}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
                    className={formErrors.resource ? 'border-red-500' : ''}
                  />
                </div>
                {formErrors.resource && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.resource}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  The resource this permission applies to (e.g., user, role, permission, system)
                </p>
              </div>

              <div>
                <Label htmlFor="action" className="text-sm font-medium">
                  Action *
                </Label>
                <div className="space-y-2">
                  <Select value={formData.action} onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger className={formErrors.action ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select an action or type a new one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manage">Manage</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type a custom action..."
                    value={formData.action}
                    onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                    className={formErrors.action ? 'border-red-500' : ''}
                  />
                </div>
                {formErrors.action && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.action}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  The action that can be performed (e.g., create, read, update, delete)
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this permission allows..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional description to explain what this permission grants access to
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {updateMutation.isPending ? 'Updating...' : 'Update Permission'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Permission Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Current Permission</CardTitle>
            <CardDescription>
              This is the current permission in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">ID:</Label>
                <span className="font-mono text-sm">{permission.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Slug:</Label>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {permission.slug}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Created:</Label>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(permission.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Updated:</Label>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(permission.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
