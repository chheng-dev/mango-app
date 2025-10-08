import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown, ChevronRight, Key, Lock, Package, Shield, ShoppingCart, Users } from "lucide-react";
import React, { useMemo } from "react";
import { type RoleFormData } from "@/lib/validations/role";
import { Permission } from "@/lib/types/permission";

export interface PermissionSectionProps {
  permissions: Permission[];
  formData: RoleFormData;
  setFormData: React.Dispatch<React.SetStateAction<RoleFormData>>;
  formErrors: Record<string, string>;
  setFormErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  expandAllSections: () => void;
  collapseAllSections: () => void;
  toggleSection?: (resource: string) => void;
  onPermissionsChange?: (permissions: number[]) => void;
}

export function PermissionSection({ 
  permissions, 
  formData, 
  setFormData, 
  formErrors, 
  setFormErrors, 
  expandAllSections, 
  collapseAllSections, 
  toggleSection,
  onPermissionsChange
}: PermissionSectionProps) {

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

  const handleToggleSection = (resource: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [resource]: !prev[resource]
    }));
    toggleSection?.(resource);
  };

  // Handle expand/collapse all
  const handleExpandAll = () => {
    const allResources = Object.keys(groupedPermissions);
    setExpandedSections(allResources.reduce((acc, resource) => ({
      ...acc,
      [resource]: true
    }), {}));
    expandAllSections();
  };

  const handleCollapseAll = () => {
    setExpandedSections({});
    collapseAllSections();
  };

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
            onClick={handleExpandAll}
            className="h-8 px-3 text-xs"
          >
            Expand All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
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
              const newPermissions = allSelected ? [] : allPermissionIds;
              
              setFormData(prev => ({
                ...prev,
                permissions: newPermissions
              }));
              
              // Call the validation handler
              onPermissionsChange?.(newPermissions);
              
              if (formErrors.permissions && setFormErrors) {
                setFormErrors((prev: any) => ({ ...prev, permissions: '' }));
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
                  className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                  onClick={() => handleToggleSection(resource)}
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
                          const resourcePermissionIds = resourcePermissions.map((p: any) => p.id);
                          const newPermissions = checked
                            ? [...new Set([...formData.permissions, ...resourcePermissionIds])]
                            : formData.permissions.filter(id => !resourcePermissionIds.includes(id));
                          
                          setFormData(prev => ({
                            ...prev,
                            permissions: newPermissions
                          }));
                          
                          // Call the validation handler
                          onPermissionsChange?.(newPermissions);
                          
                          if (formErrors.permissions && setFormErrors) {
                            setFormErrors((prev: any) => ({ ...prev, permissions: '' }));
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
                                const newPermissions = checked
                                  ? [...formData.permissions, permission.id]
                                  : formData.permissions.filter(id => id !== permission.id);
                                
                                setFormData(prev => ({
                                  ...prev,
                                  permissions: newPermissions
                                }));
                                
                                // Call the validation handler
                                onPermissionsChange?.(newPermissions);
                                
                                if (formErrors.permissions && setFormErrors) {
                                  setFormErrors((prev: any) => ({ ...prev, permissions: '' }));
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
  );
}
