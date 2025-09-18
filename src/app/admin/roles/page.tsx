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
  UserPlus
} from 'lucide-react';
import { toast } from '@/lib/utils/toast';

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

export default function RolesManagementPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/rbac/roles'),
        fetch('/api/rbac/permissions')
      ]);

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.data || []);
      } else {
        toast.error('Failed to load roles');
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        setPermissions(permissionsData.data || []);
      } else {
        toast.error('Failed to load permissions');
      }
    } catch (error) {
      toast.error('Failed to load data');
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
    router.push('/admin/roles/create');
  };

  const handleEdit = (role: Role) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
  };

  const handleView = (role: Role) => {
    router.push(`/admin/roles/edit?id=${role.id}`);
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
        toast.success('Role deleted successfully');
        await loadData();
      } else {
        toast.error('Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
      console.error('Error deleting role:', error);
    }
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

        {/* Error handling is now done via toast notifications */}

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

      </div>
    </ProtectedRoute>
  );
}
