'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FormLayout } from '@/components/ui/form-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Save,
  Loader2,
  Users,
  Key,
  Lock,
  Info,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '@/lib/utils/toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  userCount?: number;
}

interface EditRoleData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  permissions: number[];
}

export default function EditRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('id');
  
  // State
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSlugField, setShowSlugField] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<EditRoleData>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    permissions: []
  });

  // Load role and permissions
  useEffect(() => {
    if (roleId) {
      loadData();
    }
  }, [roleId]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      const [roleResponse, permissionsResponse] = await Promise.all([
        fetch(`/api/rbac/roles/${roleId}`),
        fetch('/api/rbac/permissions')
      ]);

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        const roleInfo = roleData.data;
        setRole(roleInfo);
        
        // Set form data
        setFormData({
          name: roleInfo.name,
          slug: roleInfo.slug,
          description: roleInfo.description || '',
          isActive: roleInfo.isActive,
          permissions: roleInfo.permissions?.map((p: Permission) => p.id) || []
        });
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData.data || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load role data');
      router.push('/admin/roles');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({
      ...prev,
      name,
      slug
    }));

    // Clear name error when user starts typing
    if (formErrors.name) {
      setFormErrors(prev => ({ ...prev, name: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.permissions.length === 0) {
      errors.permissions = 'At least one permission must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch(`/api/rbac/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Role updated successfully!');
        router.push('/admin/roles');
      } else {
        throw new Error(result.error || 'Failed to update role');
      }

    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  const breadcrumbs = [
    { label: 'Project', href: '/admin' },
    { label: 'Roles', href: '/admin/roles' },
    { label: 'Edit Role' }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <FormLayout
          title="Edit Role"
          subtitle="Update role information and permissions"
          breadcrumbs={breadcrumbs}
          onBack={() => router.push('/admin/roles')}
        >
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="animate-spin h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
                <Shield className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Loading Role Data</p>
                <p className="text-sm text-muted-foreground">Please wait while we fetch the role information...</p>
              </div>
            </div>
          </div>
        </FormLayout>
      </ProtectedRoute>
    );
  }

  if (!role) {
    return (
      <ProtectedRoute>
        <FormLayout
          title="Role Not Found"
          subtitle="The requested role could not be found"
          breadcrumbs={breadcrumbs}
          onBack={() => router.push('/admin/roles')}
        >
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Role Not Found</p>
                <p className="text-sm text-muted-foreground">The role you're looking for doesn't exist or has been deleted.</p>
              </div>
              <Button onClick={() => router.push('/admin/roles')} className="mt-4">
                <Shield className="h-4 w-4 mr-2" />
                Back to Roles
              </Button>
            </div>
          </div>
        </FormLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <FormLayout
        title={`Edit Role: ${role.name}`}
        subtitle="Update role information and permissions"
        breadcrumbs={breadcrumbs}
        onBack={() => router.push('/admin/roles')}
      >
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Info Header */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Editing: {role.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(role.createdAt).toLocaleDateString()} • 
                      Last updated: {new Date(role.updatedAt).toLocaleDateString()}
                      {role.userCount !== undefined && ` • ${role.userCount} users assigned`}
                    </p>
                  </div>
                  <Badge variant={role.isActive ? "default" : "secondary"} className="px-3 py-1">
                    {role.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Basic Information
                  <Info className="h-4 w-4 text-muted-foreground ml-auto" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                      Role Name 
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g., Content Manager"
                        className={cn(
                          "transition-all duration-200",
                          formErrors.name && "border-destructive focus-visible:ring-destructive"
                        )}
                        required
                      />
                      {formData.name && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.name && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug" className="text-sm font-medium">Slug</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSlugField(!showSlugField)}
                        className="h-6 px-2 text-xs"
                      >
                        {showSlugField ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {showSlugField ? 'Hide' : 'Edit'}
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, slug: e.target.value }));
                          if (formErrors.slug) {
                            setFormErrors(prev => ({ ...prev, slug: '' }));
                          }
                        }}
                        placeholder="content-manager"
                        className={cn(
                          "font-mono text-sm transition-all duration-200",
                          !showSlugField && "bg-muted cursor-not-allowed",
                          formErrors.slug && "border-destructive focus-visible:ring-destructive"
                        )}
                        disabled={!showSlugField}
                      />
                      {formData.slug && !formErrors.slug && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.slug && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.slug}
                      </div>
                    )}
                    {!showSlugField && (
                      <p className="text-xs text-muted-foreground">
                        Auto-generated from role name
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role's purpose and responsibilities..."
                    rows={3}
                    className="resize-none transition-all duration-200"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Help others understand what this role is for
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isActive" className="text-sm font-medium">Status</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.isActive ? 'Role is active and can be assigned' : 'Role is inactive and cannot be assigned'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      formData.isActive ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <span>Permissions</span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.permissions.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {formData.permissions.length} of {permissions.length} selected
                      </div>
                    )}
                    <Badge variant={formData.permissions.length > 0 ? "default" : "outline"} className="transition-all duration-200">
                      {formData.permissions.length} selected
                    </Badge>
                  </div>
                </CardTitle>
                {formErrors.permissions && (
                  <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.permissions}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Global Actions */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium">Quick Actions</div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allPermissionIds = permissions.map(p => p.id);
                          setFormData(prev => ({
                            ...prev,
                            permissions: allPermissionIds
                          }));
                          if (formErrors.permissions) {
                            setFormErrors(prev => ({ ...prev, permissions: '' }));
                          }
                        }}
                        className="h-8"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, permissions: [] }));
                        }}
                        className="h-8"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[500px] border rounded-lg">
                    <div className="p-4 space-y-6">
                      {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
                        const isExpanded = expandedSections[resource] !== false; // Default to expanded
                        const selectedCount = resourcePermissions.filter(p => formData.permissions.includes(p.id)).length;
                        const totalCount = resourcePermissions.length;
                        const allSelected = selectedCount === totalCount;
                        const someSelected = selectedCount > 0 && selectedCount < totalCount;

                        return (
                          <div key={resource} className="space-y-3">
                            <div 
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                              onClick={() => toggleSection(resource)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium capitalize">{resource} Permissions</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedCount} of {totalCount} permissions selected
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-muted rounded-full h-2">
                                    <div 
                                      className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        selectedCount > 0 ? "bg-primary" : "bg-muted"
                                      )}
                                      style={{ width: `${(selectedCount / totalCount) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground min-w-[2rem]">
                                    {Math.round((selectedCount / totalCount) * 100)}%
                                  </span>
                                </div>
                                
                                <Button
                                  type="button"
                                  variant={allSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const allResourcePermissions = resourcePermissions.map(p => p.id);
                                    
                                    if (allSelected) {
                                      // Remove all
                                      setFormData(prev => ({
                                        ...prev,
                                        permissions: prev.permissions.filter(id => !allResourcePermissions.includes(id))
                                      }));
                                    } else {
                                      // Add all
                                      setFormData(prev => ({
                                        ...prev,
                                        permissions: [...new Set([...prev.permissions, ...allResourcePermissions])]
                                      }));
                                      if (formErrors.permissions) {
                                        setFormErrors(prev => ({ ...prev, permissions: '' }));
                                      }
                                    }
                                  }}
                                  className="h-7 px-3"
                                >
                                  {allSelected ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Deselect All
                                    </>
                                  ) : (
                                    <>
                                      <Users className="h-3 w-3 mr-1" />
                                      Select All
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                                {resourcePermissions.map((permission) => {
                                  const isSelected = formData.permissions.includes(permission.id);
                                  
                                  return (
                                    <div 
                                      key={permission.id} 
                                      className={cn(
                                        "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                                        isSelected 
                                          ? "bg-primary/5 border-primary/20 shadow-sm" 
                                          : "bg-background border-border hover:border-primary/30"
                                      )}
                                    >
                                      <Checkbox
                                        id={`permission-${permission.id}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setFormData(prev => ({
                                              ...prev,
                                              permissions: [...prev.permissions, permission.id]
                                            }));
                                            if (formErrors.permissions) {
                                              setFormErrors(prev => ({ ...prev, permissions: '' }));
                                            }
                                          } else {
                                            setFormData(prev => ({
                                              ...prev,
                                              permissions: prev.permissions.filter(id => id !== permission.id)
                                            }));
                                          }
                                        }}
                                        className="transition-all duration-200"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <Label 
                                          htmlFor={`permission-${permission.id}`} 
                                          className="text-sm cursor-pointer font-medium leading-tight"
                                        >
                                          {permission.name}
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge 
                                            variant="secondary" 
                                            className={cn(
                                              "text-xs px-2 py-0.5",
                                              isSelected && "bg-primary/10 text-primary border-primary/20"
                                            )}
                                          >
                                            {permission.action}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground font-mono">
                                            {permission.slug}
                                          </span>
                                        </div>
                                        {permission.description && (
                                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {permission.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Ready to save changes?</p>
                    <p className="text-xs text-muted-foreground">
                      Make sure all information is correct before updating the role
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/admin/roles')}
                      className="min-w-[100px]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={saving || !formData.name.trim()}
                      className={cn(
                        "min-w-[140px] transition-all duration-200",
                        saving && "cursor-not-allowed"
                      )}
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Update Role
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </FormLayout>
    </ProtectedRoute>
  );
}
