'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable, Column, DataTableAction } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, UserX, Eye, Edit, Trash2, Mail, Plus, RefreshCw } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/lib/api/UserService';

export default function UsersPage() {
  const router = useRouter();
  const {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    updateUserStatus,
    clearError,
  } = useUsers();

  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Clear error on component mount
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateUser = useCallback(() => {
    router.push('/admin/users/create');
  }, [router]);

  const handleEditUser = useCallback((user: User) => {
    router.push(`/admin/users/edit?id=${user.id}`);
  }, [router]);

  const handleDeleteUser = useCallback(async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteLoading(user.id);
    try {
      const result = await deleteUser(user.id);
      if (!result.success) {
        alert(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An unexpected error occurred while deleting the user');
    } finally {
      setDeleteLoading(null);
    }
  }, [deleteUser]);

  const handleStatusToggle = useCallback(async (user: User) => {
    try {
      await updateUserStatus(user.id, !user.isActive);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }, [updateUserStatus]);

  // Memoized columns for performance
  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'name',
      title: 'User Details',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`/placeholder-${item.id}.jpg`} />
            <AvatarFallback>
              {item.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium">{item.name}</div>
              <Badge variant="outline" className="text-xs">{item.code}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{item.email}</div>
            {item.phoneNumber && (
              <div className="text-xs text-muted-foreground">
                📞 {item.phoneNumber}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Contact',
      sortable: true,
      render: (value, item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{value}</span>
          </div>
          {item.phoneNumber && (
            <div className="text-xs text-muted-foreground">
              {item.phoneNumber}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value, item) => (
        <div className="space-y-1">
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
          <div>
            {item.isVerified ? (
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
  ], []);

  // Memoized row actions for performance
  const rowActions: DataTableAction<User>[] = useMemo(() => [
    {
      label: 'Edit User',
      icon: Edit,
      onClick: handleEditUser
    },
    {
      label: 'Send Email',
      icon: Mail,
      onClick: (user) => {
        // Open email client or modal
        window.open(`mailto:${user.email}`, '_blank');
      }
    },
    {
      label: 'Toggle Status',
      icon: UserCheck,
      onClick: handleStatusToggle,
      variant: 'default'
    },
    {
      label: 'Delete User',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDeleteUser,
      loading: (user: User) => deleteLoading === user.id
    }
  ], [handleEditUser, handleStatusToggle, handleDeleteUser, deleteLoading]);

  const handleAddUser = useCallback(() => {
    handleCreateUser();
  }, [handleCreateUser]);

  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (error) {
    return (
      <ProtectedRoute>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Users</h1>
              <p className="text-muted-foreground">
                Manage users and their permissions
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800">Error Loading Users</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage users and their permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <DataTable
          data={users}
          columns={columns}
          title="User Management"
          description="A list of all users in your application"
          searchPlaceholder="Search users by name, email, or code..."
          rowActions={rowActions}
          onAdd={handleAddUser}
          addButtonText="Add User"
        />
      </div>
    </ProtectedRoute>
  );
}
