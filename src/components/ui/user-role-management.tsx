'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column, DataTableAction } from '@/components/ui/data-table';
import { RolePermissionModal } from '@/components/ui/role-permission-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Settings
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  code: string;
  isActive: boolean;
  isVerified: boolean;
  phoneNumber?: string;
  createdAt: string;
  roles?: Role[];
  permissions?: Permission[];
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

interface UserRoleManagementProps {
  users: User[];
  onRefresh: () => void;
  loading?: boolean;
}

export function UserRoleManagement({ users, onRefresh, loading = false }: UserRoleManagementProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.roles && user.roles.some(role => 
          role.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleManageRoles = useCallback((user: User) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  }, []);

  const handleSaveRolesPermissions = async (data: any) => {
    setSaveLoading(true);
    try {
      // Save roles
      if (data.roles && data.roles.length > 0) {
        for (const roleId of data.roles) {
          const response = await fetch(`/api/users/${data.userId}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleId, assignedBy: 1 }) // TODO: Get current user ID
          });
          
          if (!response.ok) {
            throw new Error('Failed to assign role');
          }
        }
      }

      // Remove unselected roles
      if (selectedUser?.roles) {
        for (const role of selectedUser.roles) {
          if (!data.roles.includes(role.id)) {
            const response = await fetch(`/api/users/${data.userId}/roles?roleId=${role.id}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              throw new Error('Failed to remove role');
            }
          }
        }
      }

      // Refresh user data
      onRefresh();
      setRoleModalOpen(false);
    } catch (error) {
      console.error('Error saving roles/permissions:', error);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  // Define columns for the data table
  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'User',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/placeholder-${user.id}.jpg`} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium">{user.name}</div>
              <Badge variant="outline" className="text-xs">{user.code}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            {user.phoneNumber && (
              <div className="text-xs text-muted-foreground">
                📞 {user.phoneNumber}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      title: 'Roles & Permissions',
      render: (value, user) => (
        <div className="space-y-2">
          {/* Roles */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Roles</div>
            <div className="flex flex-wrap gap-1">
              {user.roles && user.roles.length > 0 ? (
                user.roles.slice(0, 3).map((role) => (
                  <Badge key={role.id} variant="default" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {role.name}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">No roles</Badge>
              )}
              {user.roles && user.roles.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{user.roles.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {/* Permissions count */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Permissions</div>
            <Badge variant="outline" className="text-xs">
              <ShieldCheck className="w-3 h-3 mr-1" />
              {user.permissions?.length || 0} permissions
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value, user) => (
        <div className="space-y-1">
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
          <div>
            {user.isVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                <UserCheck className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
                <UserX className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
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
  const rowActions: DataTableAction<User>[] = [
    {
      label: 'Manage Roles & Permissions',
      icon: Shield,
      onClick: handleManageRoles,
      variant: 'default'
    },
    {
      label: 'View Details',
      icon: Eye,
      onClick: (user) => {
        // Navigate to user details or open view modal
        console.log('View user details:', user);
      }
    },
    {
      label: 'Edit User',
      icon: Edit,
      onClick: (user) => {
        // Navigate to edit user page
        window.location.href = `/admin/users/edit?id=${user.id}`;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, roles, or permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => window.location.href = '/admin/roles'} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isActive).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles && u.roles.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((users.filter(u => u.roles && u.roles.length > 0).length / users.length) * 100).toFixed(0)}% of users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((users.filter(u => u.isVerified).length / users.length) * 100).toFixed(0)}% verified
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => !u.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        title="User Role & Permission Management"
        description="Manage user roles and permissions from a centralized dashboard"
        searchPlaceholder="Search users..."
        rowActions={rowActions}
      />

      {/* Role Permission Modal */}
      <RolePermissionModal
        user={selectedUser}
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveRolesPermissions}
        loading={saveLoading}
      />
    </div>
  );
}
