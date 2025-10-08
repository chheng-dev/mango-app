import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { usePermissionFormWithQuery } from '@/hooks/usePermissionFormWithQuery';
import { PERMISSION_ACTIONS } from '@/lib/validations/permission-schemas';
import { forwardRef, useImperativeHandle } from 'react';
import { Shield, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';

export interface PermissionFormRef {
  submit: () => void;
  triggerValidation: () => Promise<boolean>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

interface PermissionFormProps {
  permissionId?: string | number;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  loading?: boolean;
  deleteLoading?: boolean;
  className?: string;
}

export const PermissionForm = forwardRef<PermissionFormRef, PermissionFormProps>(({
  permissionId,
  mode,
  onSuccess,
  onError,
  onCancel,
  onDelete,
  deleteLoading,
  className
}, ref) => {

  const {
    form,
    handleSubmit,
    setValue,
    isSubmitting,
    isLoadingPermission,
    permissionError,
    isValid,
    isDirty,
  } = usePermissionFormWithQuery({
    permissionId,
    mode,
    onSuccess,
    onError
  });

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
  
  if (isLoadingPermission && mode === 'edit') {
    return (
      <div className="w-full mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground">Loading permission...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (permissionError && mode === 'edit') {
    return (
      <div className="w-full mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <span>Failed to load permission data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto space-y-6 ${className || ''}`}>
      <ScrollArea>
        {/* Main Form Card */}
        <Card className='mb-12'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {mode === 'create' ? 'Create Permission' : 'Edit Permission'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Define a new permission to control access to specific resources and actions.'
                : 'Update the permission details. Changes will affect all users and roles with this permission.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Permission Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permission Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., Manage Users, View Reports, Edit Settings" 
                          className="font-medium"
                        />
                      </FormControl>
                      <FormDescription>
                        A clear, human-readable name that describes what this permission allows
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Resource and Action Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resource */}
                  <FormField
                    control={form.control}
                    name="resource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., users, roles, permissions" 
                            className="lowercase"
                          />
                        </FormControl>
                        <FormDescription>
                          The resource this permission controls access to
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action */}
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g., create, read, update, delete" 
                            className="lowercase"
                          />
                        </FormControl>
                        <FormDescription>
                          The specific action that can be performed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium">Quick Actions</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {PERMISSION_ACTIONS.map((action) => (
                      <Button
                        key={action}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setValue('action', action)}
                        className="h-8 text-xs capitalize hover:bg-primary hover:text-primary-foreground"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Provide additional context about when and how this permission should be used..."
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional detailed description to help administrators understand this permission's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Toggle */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          When enabled, this permission can be assigned to users and roles
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          
          <div className="flex items-center gap-2">
            {mode === 'edit' && onDelete && (
              <Button 
                type="button"
                variant="destructive" 
                onClick={onDelete}
                disabled={isSubmitting || deleteLoading}
                className="flex items-center gap-2"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Delete
              </Button>
            )}
            
            <Button 
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {mode === 'create' ? 'Create Permission' : 'Update Permission'}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
});

PermissionForm.displayName = 'PermissionForm';