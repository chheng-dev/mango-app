'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column, DataTableAction } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Save,
  X,
  UserPlus
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export default function RolesManagementPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    permissions: []
  });
  const [formErrors, setFormErrors] = useState<Partial<RoleFormData>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/rbac/roles'),
        fetch('/api/rbac/permissions')
      ]);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.data || []);
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData.data || []);
      }
    } catch (error) {
      setError('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedRole(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      permissions: []
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      isActive: role.isActive,
      permissions: role.permissions?.map(p => p.id) || []
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleView = (role: Role) => {
    setModalMode('view');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      isActive: role.isActive,
      permissions: role.permissions?.map(p => p.id) || []
    });
    setModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/rbac/roles/${role.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadData();
      } else {
        setError('Failed to delete role');
      }
    } catch (error) {
      setError('Failed to delete role');
      console.error('Error deleting role:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<RoleFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Role slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const url = modalMode === 'create' 
        ? '/api/rbac/roles' 
        : `/api/rbac/roles/${selectedRole?.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModalOpen(false);
        await loadData();
      } else {
        setError(`Failed to ${modalMode} role`);
      }
    } catch (error) {
      setError(`Failed to ${modalMode} role`);
      console.error(`Error ${modalMode} role:`, error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof RoleFormData, value: string | boolean | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Define columns for the data table
  const columns: Column<Role>[] = [
    {
      key: 'name',
      title: 'Role',
      sortable: true,
      render: (value, role) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium">{role.name}</div>
            <Badge variant="outline" className="text-xs">{role.slug}</Badge>
            {!role.isActive && (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
          </div>
          {role.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {role.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (value, role) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {role.permissions?.length || 0} permissions
            </span>
          </div>
          {role.permissions && role.permissions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 3).map((permission) => (
                <Badge key={permission.id} variant="secondary" className="text-xs">
                  {permission.slug}
                </Badge>
              ))}
              {role.permissions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{role.permissions.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'userCount',
      title: 'Users',
      sortable: true,
      render: (value, role) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[50px]'
    }
  ];

  // Define row actions
  const rowActions: DataTableAction<Role>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: handleView
    },
    {
      label: 'Edit Role',
      icon: Edit,
      onClick: handleEdit
    },
    {
      label: 'Assign to Users',
      icon: UserPlus,
      onClick: (role) => {
        router.push(`/admin/roles/${role.id}/assign-users`);
      },
      variant: 'default'
    },
    {
      label: 'Delete Role',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDelete
    }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Role Management
            </h1>
            <p className="text-muted-foreground">
              Manage roles and their permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                {roles.filter(r => r.isActive).length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
              <p className="text-xs text-muted-foreground">
                {Object.keys(groupedPermissions).length} resources
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.filter(r => r.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {roles.filter(r => !r.isActive).length} inactive
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(groupedPermissions).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Permission groups
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredRoles}
          columns={columns}
          title="Roles"
          description="Manage system roles and their permissions"
          searchPlaceholder="Search roles..."
          rowActions={rowActions}
          onAdd={handleCreate}
          addButtonText="Create Role"
        />

        {/* Role Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {modalMode === 'create' ? 'Create New Role' : 
                 modalMode === 'edit' ? 'Edit Role' : 'Role Details'}
              </DialogTitle>
              <DialogDescription>
                {modalMode === 'create' ? 'Create a new role and assign permissions' :
                 modalMode === 'edit' ? 'Update role information and permissions' :
                 'View role details and permissions'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={modalMode === 'view'}
                    className={formErrors.name ? 'border-red-500' : ''}
                    placeholder="Enter role name"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Role Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    disabled={modalMode === 'view'}
                    className={formErrors.slug ? 'border-red-500' : ''}
                    placeholder="role-slug"
                  />
                  {formErrors.slug && (
                    <p className="text-sm text-red-500">{formErrors.slug}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={modalMode === 'view'}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  disabled={modalMode === 'view'}
                />
                <Label htmlFor="isActive">Active Role</Label>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Permissions</h3>
                  <Badge variant="outline">
                    {formData.permissions.length} selected
                  </Badge>
                </div>
                
                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                      <div key={resource}>
                        <h4 className="font-medium capitalize mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {resource} Permissions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`perm-${permission.id}`}
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                disabled={modalMode === 'view'}
                              />
                              <Label 
                                htmlFor={`perm-${permission.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {permission.name}
                              </Label>
                              <Badge variant="outline" className="text-xs">
                                {permission.action}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {modalMode !== 'view' && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {modalMode === 'create' ? 'Create Role' : 'Update Role'}
                    </div>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
