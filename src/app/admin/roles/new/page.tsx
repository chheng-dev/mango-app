'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable, Column, DataTableAction } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface CreateRoleData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  permissions: number[];
}

export default function RolesPage() {
  const router = useRouter();
  
  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    permissions: []
  });
  
  // Action loading states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Load data
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
      console.error('Error loading data:', error);
      setError('Failed to load roles and permissions');
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
  };

  // Handle create role
  const handleCreateRole = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Role created successfully!');
        setIsCreateModalOpen(false);
        resetForm();
        await loadData();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to create role');
      }

    } catch (error) {
      console.error('Error creating role:', error);
      setError('Failed to create role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit role
  const handleEditRole = async () => {
    if (!editingRole) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/rbac/roles/${editingRole.id}`, {
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
        setSuccess('Role updated successfully!');
        setIsEditModalOpen(false);
        setEditingRole(null);
        resetForm();
        await loadData();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to update role');
      }

    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete role
  const handleDeleteRole = async () => {
    if (!deletingRole) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/rbac/roles/${deletingRole.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete role');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Role deleted successfully!');
        setIsDeleteModalOpen(false);
        setDeletingRole(null);
        await loadData();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to delete role');
      }

    } catch (error) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      permissions: []
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      isActive: role.isActive,
      permissions: role.permissions?.map(p => p.id) || []
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  // Table columns
  const columns: Column<Role>[] = useMemo(() => [
    {
      key: 'name',
      title: 'Role Details',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="font-medium">{item.name}</div>
            <Badge variant="outline" className="text-xs">{item.slug}</Badge>
          </div>
          {item.description && (
            <div className="text-sm text-muted-foreground">{item.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {item.permissions?.length || 0} permission{(item.permissions?.length || 0) !== 1 ? 's' : ''}
          </div>
          {item.permissions && item.permissions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.permissions.slice(0, 3).map((permission) => (
                <Badge key={permission.id} variant="secondary" className="text-xs">
                  {permission.action}
                </Badge>
              ))}
              {item.permissions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.permissions.length - 3}
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
      render: (value, item) => (
        <div className="text-center">
          <div className="text-lg font-medium">{item.userCount || 0}</div>
          <div className="text-xs text-muted-foreground">assigned</div>
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
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
    }
  ], []);

  // Table actions
  const rowActions: DataTableAction<Role>[] = useMemo(() => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (role) => {
        // Could open a detailed view modal or navigate to details page
        console.log('View role details:', role);
      }
    },
    {
      label: 'Edit Role',
      icon: Edit,
      onClick: openEditModal
    },
    {
      label: 'Delete Role',
      icon: Trash2,
      variant: 'destructive',
      onClick: openDeleteModal,
      disabled: (role: any) => (role.userCount || 0) > 0 // Prevent deletion if users are assigned
    }
  ], []);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterActive === 'all' || 
        (filterActive === 'active' && role.isActive) ||
        (filterActive === 'inactive' && !role.isActive);
      
      return matchesSearch && matchesFilter;
    });
  }, [roles, searchTerm, filterActive]);

  // Group permissions by resource for the form
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

  // Statistics
  const stats = useMemo(() => ({
    total: roles.length,
    active: roles.filter(r => r.isActive).length,
    inactive: roles.filter(r => !r.isActive).length,
    totalUsers: roles.reduce((sum, role) => sum + (role.userCount || 0), 0)
  }), [roles]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading roles...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Create and manage system roles and their permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => loadData()} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <Shield className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Total Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <ShieldCheck className="h-4 w-4 ml-auto text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground">Active Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
                <Shield className="h-4 w-4 ml-auto text-gray-500" />
              </div>
              <p className="text-xs text-muted-foreground">Inactive Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <Users className="h-4 w-4 ml-auto text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Users Assigned</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles by name, slug, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable
          data={filteredRoles}
          columns={columns}
          title="System Roles"
          description={`Manage ${filteredRoles.length} role${filteredRoles.length !== 1 ? 's' : ''}`}
          searchPlaceholder="Search roles..."
          rowActions={rowActions}
          onAdd={openCreateModal}
          addButtonText="Create Role"
        />

        {/* Create/Edit Role Modal */}
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setEditingRole(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isCreateModalOpen ? 'Create New Role' : 'Edit Role'}
              </DialogTitle>
              <DialogDescription>
                {isCreateModalOpen 
                  ? 'Create a new role and assign permissions'
                  : `Edit ${editingRole?.name} role and manage permissions`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="role-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the role and its purpose"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active Role</Label>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Permissions</Label>
                  <Badge variant="outline">
                    {formData.permissions.length} selected
                  </Badge>
                </div>
                
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                      <div key={resource} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium capitalize">{resource} Permissions</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const allResourcePermissions = resourcePermissions.map(p => p.id);
                              const hasAll = allResourcePermissions.every(id => formData.permissions.includes(id));
                              
                              if (hasAll) {
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
                              }
                            }}
                          >
                            {resourcePermissions.every(p => formData.permissions.includes(p.id)) ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {resourcePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`permission-${permission.id}`}
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission.id]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(id => id !== permission.id)
                                    }));
                                  }
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <Label htmlFor={`permission-${permission.id}`} className="text-sm cursor-pointer">
                                  {permission.name}
                                </Label>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {permission.action}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {permission.slug}
                                  </span>
                                </div>
                              </div>
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
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setEditingRole(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={isCreateModalOpen ? handleCreateRole : handleEditRole}
                disabled={saving || !formData.name.trim()}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isCreateModalOpen ? 'Creating...' : 'Updating...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isCreateModalOpen ? 'Create Role' : 'Update Role'}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDeleteModalOpen(false);
            setDeletingRole(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Delete Role
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the role "{deletingRole?.name}"? This action cannot be undone.
                {(deletingRole?.userCount || 0) > 0 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">
                      ⚠️ This role is currently assigned to {deletingRole?.userCount} user{(deletingRole?.userCount || 0) !== 1 ? 's' : ''}. 
                      Please reassign these users before deleting this role.
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingRole(null);
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteRole}
                disabled={deleting || (deletingRole?.userCount || 0) > 0}
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Role
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
