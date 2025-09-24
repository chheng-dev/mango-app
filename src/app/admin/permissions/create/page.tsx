"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { HeaderComp } from "@/components/share/header-comp";
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
import { ArrowLeft, Save, X } from 'lucide-react';
import { 
  useCreatePermission,
  usePermissionResources 
} from '@/hooks/usePermissionsData';
import { CreatePermissionData } from '@/lib/api/permissionApiService';
import { toast } from '@/lib/utils/toast';

interface PermissionFormData {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export default function CreatePermissionPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    resource: '',
    action: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<PermissionFormData>>({});

  // API hooks
  const { data: resourcesData } = usePermissionResources();
  const createMutation = useCreatePermission();

  const resources = resourcesData?.data || [];

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
    if (!validateForm()) return;

    const createData: CreatePermissionData = {
      name: formData.name.trim(),
      resource: formData.resource.trim(),
      action: formData.action.trim(),
      description: formData.description.trim() || undefined
    };

    try {
      await createMutation.mutateAsync(createData);
      toast.success('Permission created successfully');
      router.push('/admin/permissions');
    } catch (error) {
      console.error('Create permission error:', error);
      toast.error('Failed to create permission');
    }
  }

  function handleCancel() {
    router.push('/admin/permissions');
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
                Create Permission
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add a new permission to the system
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
              Enter the details for the new permission. All fields marked with * are required.
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
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {createMutation.isPending ? 'Creating...' : 'Create Permission'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>
              This is how your permission will appear in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Name:</Label>
                <span className="font-medium">{formData.name || 'Permission name will appear here'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Slug:</Label>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {formData.name ? 
                    formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
                    'permission-slug'
                  }
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Resource:</Label>
                <span className="capitalize">{formData.resource || 'resource'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium w-20">Action:</Label>
                <span className="capitalize">{formData.action || 'action'}</span>
              </div>
              {formData.description && (
                <div className="flex items-start gap-2">
                  <Label className="text-sm font-medium w-20">Description:</Label>
                  <span className="text-gray-600 dark:text-gray-300">{formData.description}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}