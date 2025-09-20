'use client';

import { useState, useMemo, useEffect } from 'react';
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
  EyeOff,
  Package,
  ShoppingCart,
  UserPlus
} from 'lucide-react';
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

interface RoleFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  permissions: number[];
}

interface RoleFormProps {
  initialData?: Partial<RoleFormData>;
  permissions: Permission[];
  onSubmit: (data: RoleFormData) => Promise<void>;
  saving: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
}

export function RoleForm({ 
  initialData = {}, 
  permissions, 
  onSubmit, 
  saving, 
  mode,
  onCancel 
}: RoleFormProps) {
  // State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSlugField, setShowSlugField] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    permissions: [],
    ...initialData
  });

  // Initialize expanded sections when permissions are loaded
  useEffect(() => {
    if (permissions.length > 0) {
      const initialExpanded = permissions.reduce((acc, permission) => {
        acc[permission.resource] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedSections(initialExpanded);
    }
  }, [permissions]);

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

  // Expand all sections
  const expandAllSections = () => {
    const allExpanded = Object.keys(groupedPermissions).reduce((acc, resource) => {
      acc[resource] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(allExpanded);
  };

  // Collapse all sections
  const collapseAllSections = () => {
    const allCollapsed = Object.keys(groupedPermissions).reduce((acc, resource) => {
      acc[resource] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSections(allCollapsed);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
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

  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Role Name 
              <span className="text-destructive text-lg">*</span>
            </Label>
            <div className="relative group">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Content Manager"
                className={cn(
                  "transition-all duration-300 text-base h-12 pl-4 pr-12",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "group-hover:border-primary/50",
                  formErrors.name && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
                )}
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {formData.name ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
                ) : (
                  <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full"></div>
                )}
              </div>
            </div>
            {formErrors.name && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-left duration-200">
                <AlertCircle className="h-4 w-4" />
                {formErrors.name}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Choose a clear, descriptive name for this role
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug" className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                URL Slug
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSlugField(!showSlugField)}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all duration-200",
                  showSlugField ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                {showSlugField ? (
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
                  "font-mono text-sm transition-all duration-300 h-12 pl-4 pr-12",
                  "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  !showSlugField && "bg-muted/50 cursor-not-allowed opacity-75",
                  formErrors.slug && "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
                )}
                disabled={!showSlugField}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {formData.slug && !formErrors.slug ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 animate-in zoom-in duration-200" />
                ) : formErrors.slug ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full"></div>
                )}
              </div>
            </div>
            {formErrors.slug && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-right duration-200">
                <AlertCircle className="h-4 w-4" />
                {formErrors.slug}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {!showSlugField ? 'Automatically generated from role name' : 'Used in URLs and API endpoints'}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role's purpose and responsibilities..."
            rows={4}
            className={cn(
              "resize-none transition-all duration-300 text-base p-4",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "hover:border-primary/50"
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Help others understand what this role is for</span>
            <span>{formData.description.length} characters</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Role Status */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            Role Status
          </Label>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors duration-200">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full transition-colors duration-200",
                  formData.isActive ? "bg-green-500 shadow-green-500/50 shadow-sm" : "bg-gray-400"
                )}></div>
                <span className="font-medium text-sm">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {formData.isActive 
                  ? 'This role can be assigned to users and permissions will be enforced'
                  : 'This role is disabled and cannot be assigned to new users'
                }
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Permissions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                Role Permissions
                <span className="text-destructive text-lg">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Select which permissions this role should have. Users with this role will inherit these permissions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {formData.permissions.length} selected
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={expandAllSections}
                className="h-8 px-3 text-xs"
              >
                Expand All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={collapseAllSections}
                className="h-8 px-3 text-xs"
              >
                Collapse All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allPermissionIds = permissions.map(p => p.id);
                  const allSelected = allPermissionIds.every(id => formData.permissions.includes(id));
                  setFormData(prev => ({
                    ...prev,
                    permissions: allSelected ? [] : allPermissionIds
                  }));
                  if (formErrors.permissions) {
                    setFormErrors(prev => ({ ...prev, permissions: '' }));
                  }
                }}
                className="h-8 px-3 text-xs"
              >
                {formData.permissions.length === permissions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

          {formErrors.permissions && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-left duration-200 bg-destructive/5 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" />
              {formErrors.permissions}
            </div>
          )}

          <ScrollArea className="h-full w-full border rounded-lg">
            <div className="p-4 space-y-4">
              {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
                const isExpanded = expandedSections[resource] ?? true;
                const selectedCount = resourcePermissions.filter(p => formData.permissions.includes(p.id)).length;
                const totalCount = resourcePermissions.length;
                const allSelected = selectedCount === totalCount;
                const someSelected = selectedCount > 0;

                return (
                  <Card key={resource} className="border shadow-sm">
                    <CardHeader 
                      className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                      onClick={() => toggleSection(resource)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold",
                              resource === 'users' && "bg-blue-500",
                              resource === 'roles' && "bg-purple-500",
                              resource === 'permissions' && "bg-orange-500",
                              resource === 'products' && "bg-green-500",
                              resource === 'orders' && "bg-red-500",
                              !['users', 'roles', 'permissions', 'products', 'orders'].includes(resource) && "bg-gray-500"
                            )}>
                              {resource === 'users' && <Users className="h-4 w-4" />}
                              {resource === 'roles' && <Shield className="h-4 w-4" />}
                              {resource === 'permissions' && <Key className="h-4 w-4" />}
                              {resource === 'products' && <Package className="h-4 w-4" />}
                              {resource === 'orders' && <ShoppingCart className="h-4 w-4" />}
                              {!['users', 'roles', 'permissions', 'products', 'orders'].includes(resource) && <Lock className="h-4 w-4" />}
                            </div>
                            <div>
                              <CardTitle className="text-base capitalize">
                                {resource.replace(/([A-Z])/g, ' $1').trim()}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {selectedCount} of {totalCount} permissions selected
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}
                            className={cn(
                              "text-xs transition-all duration-200",
                              allSelected && "bg-green-500 hover:bg-green-600",
                              someSelected && !allSelected && "bg-orange-500 hover:bg-orange-600 text-white"
                            )}
                          >
                            {selectedCount}/{totalCount}
                          </Badge>
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) => {
                              const resourcePermissionIds = resourcePermissions.map(p => p.id);
                              setFormData(prev => ({
                                ...prev,
                                permissions: checked
                                  ? [...new Set([...prev.permissions, ...resourcePermissionIds])]
                                  : prev.permissions.filter(id => !resourcePermissionIds.includes(id))
                              }));
                              if (formErrors.permissions) {
                                setFormErrors(prev => ({ ...prev, permissions: '' }));
                              }
                            }}
                            className={cn(
                              "transition-all duration-200",
                              someSelected && !allSelected && "data-[state=checked]:bg-orange-500"
                            )}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="pt-0 space-y-3">
                        <div className="grid gap-3">
                          {resourcePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50",
                                formData.permissions.includes(permission.id) && "bg-primary/5 border-primary/20"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  checked={formData.permissions.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: checked
                                        ? [...prev.permissions, permission.id]
                                        : prev.permissions.filter(id => id !== permission.id)
                                    }));
                                    if (formErrors.permissions) {
                                      setFormErrors(prev => ({ ...prev, permissions: '' }));
                                    }
                                  }}
                                  className="transition-all duration-200"
                                />
                                <div className="space-y-1">
                                  <Label 
                                    htmlFor={`permission-${permission.id}`}
                                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                                  >
                                    {permission.name}
                                    <Badge variant="outline" className="text-xs font-normal">
                                      {permission.action}
                                    </Badge>
                                  </Label>
                                  {permission.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {permission.slug}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

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
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={cn(
                "min-w-[120px] transition-all duration-200",
                saving && "animate-pulse"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === 'edit' ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {mode === 'edit' ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {mode === 'edit' ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
