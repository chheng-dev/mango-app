'use client';

import { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { 
  Loader2,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PermissionSection } from './sections/role/permission';
import { useRoleFormWithQuery } from '@/hooks/useRoleFormWithQuery';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Card, CardContent } from '../ui/card';
import { Permission } from '@/lib/types/permission';

interface RoleFormProps {
  roleId?: string | number;
  mode: 'create' | 'edit';
  onSuccess?: (role: any) => void;
  onCancel: () => void;
}

export interface RoleFormRef {
  submit: () => void;
  triggerValidation: () => Promise<boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export const RoleForm = forwardRef<RoleFormRef, RoleFormProps>(({ 
  roleId,
  mode,
  onSuccess,
}, ref) => {
  const {
    handleSubmit,
    formData,
    errors,
    isSubmitting,
    isValid,
    isDirty,
    enableSlugEditing,
    disableSlugEditing,
    isSlugManuallyEdited,
    handlePermissionsChange,
    permissions,
    isLoadingPermissions,
    isLoadingRole,
    form,
  } = useRoleFormWithQuery({ 
    roleId, 
    mode, 
    onSuccess,
    onError: (error) => console.error('Role form error:', error)
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (permissions.length > 0) {
      const initialExpanded = permissions.reduce((acc: Record<string, boolean>, permission: any) => {
        acc[permission.resource] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedSections(initialExpanded);
    }
  }, [permissions]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit();
    },
    triggerValidation: async () => {
      return await form.trigger();
    },
    isValid,
    isDirty,
    isSubmitting,
  }), [handleSubmit, form, isValid, isDirty, isSubmitting]);

  const expandAllSections = () => {
    const allExpanded = Object.keys(groupedPermissions).reduce((acc, resource) => {
      acc[resource] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(allExpanded);
  };

  const collapseAllSections = () => {
    const allCollapsed = Object.keys(groupedPermissions).reduce((acc, resource) => {
      acc[resource] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(allCollapsed);
  };

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  if (isLoadingRole || isLoadingPermissions) {
    return (
      <div className="w-full mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-8">
      <ScrollArea>
        <Card className='mb-12'>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Role Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Content Manager"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>Choose a clear, descriptive name for this role</FormDescription>
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>URL Slug</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={isSlugManuallyEdited ? disableSlugEditing : enableSlugEditing}
                            className={cn(
                              "h-8 px-3 text-xs font-medium transition-all duration-200",
                              isSlugManuallyEdited ? "bg-primary/10 text-primary" : "hover:bg-muted"
                            )}
                          >
                            {isSlugManuallyEdited ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Auto-generate
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Edit manually
                              </>
                            )}
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="content-manager"
                            className="font-mono"
                            disabled={!isSlugManuallyEdited}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          {!isSlugManuallyEdited ? 'Automatically generated from role name' : 'Used in URLs and API endpoints'}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the role's purpose and responsibilities..."
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <FormDescription>Help others understand what this role is for</FormDescription>
                        <span className={cn(
                          field.value?.length > 450 && "text-orange-500",
                          field.value?.length > 500 && "text-destructive"
                        )}>{field.value?.length || 0}/500 characters</span>
                      </div>
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Status</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm">
                                {field.value ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {field.value 
                                ? 'This role can be assigned to users and permissions will be enforced'
                                : 'This role is disabled and cannot be assigned to new users'
                              }
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Separator className="my-6" />

              <PermissionSection
                permissions={permissions}
                formData={formData}
                setFormData={(updater: any) => {
                  if (typeof updater === 'function') {
                    const currentData = formData;
                    const newData = updater(currentData);
                    form.setValue('permissions', newData.permissions, { shouldValidate: true });
                  } else {
                    form.setValue('permissions', updater.permissions, { shouldValidate: true });
                  }
                }}
                formErrors={{ permissions: errors.permissions?.message || '' }}
                setFormErrors={() => {}} 
                expandAllSections={expandAllSections}
                collapseAllSections={collapseAllSections}
                onPermissionsChange={handlePermissionsChange}
              />

              <Separator className="my-6" />

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>
                    {mode === 'edit' 
                      ? 'Changes will be applied immediately after saving'
                      : 'Role will be created with the selected permissions'
                    }
                  </span>
                </div>
              </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
});

RoleForm.displayName = 'RoleForm';
