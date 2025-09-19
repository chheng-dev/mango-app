'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable, Column, DataTableAction } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2, 
  Mail, 
  Shield, 
  AlertTriangle, 
  Users, 
  UserPlus,
  Home,
  Filter,
  Download
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/lib/api/userApiService';
import { toast } from '@/lib/utils/toast';

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
    const confirmMessage = `Delete User: ${user.name}

This action cannot be undone. Are you sure you want to delete this user?

User Details:
• Email: ${user.email}
• Code: ${user.code}
• Status: ${user.isActive ? 'Active' : 'Inactive'}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(user.id);
    try {
      await deleteUser(user.id);
      toast.success(`User "${user.name}" has been deleted successfully`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  }, [deleteUser]);    
  const handleStatusToggle = useCallback(async (user: User) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const confirmMessage = `${action.charAt(0).toUpperCase() + action.slice(1)} User: ${user.name}

Are you sure you want to ${action} this user?

This will ${user.isActive ? 'prevent them from accessing the system' : 'allow them to access the system again'}.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await updateUserStatus(user.id, !user.isActive);
      toast.success(`User "${user.name}" has been ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status. Please try again.');
    }
  }, [updateUserStatus]);

  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'name',
      title: 'User Details',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/placeholder-${item.id}.jpg`} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {item.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {item.name || 'Unknown User'}
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-gray-50 dark:bg-gray-800">
                {item.code}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {item.email}
            </div>
            {item.phoneNumber && (
              <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                <span>📞</span>
                <span>{item.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (value, item) => (
        <div className="space-y-2">
          <div>
            {item.isActive ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                <UserCheck className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                <UserX className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
          
          {/* Verification Status */}
          <div>
            {item.isVerified ? (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Contact Info',
      render: (value, item) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
              {item.email}
            </span>
          </div>
          {item.phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">📱</span>
              <span className="text-gray-600 dark:text-gray-400">
                {item.phoneNumber}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${isRecent ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {date.toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {isRecent && (
              <Badge variant="outline" className="text-xs mt-1 bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                New
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[50px]'
    }
  ], []);

  const rowActions: DataTableAction<User>[] = useMemo(() => [
    {
      label: 'Manage Roles (Full)',
      icon: Shield,
      onClick: (user) => {
        router.push(`/admin/users/roles/manage?userId=${user.id}`);
      },
      variant: 'default'
    },
    {
      label: 'Edit User',
      icon: Edit,
      onClick: handleEditUser
    },
    {
      label: 'Send Email',
      icon: Mail,
      onClick: (user) => {
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
  ], [handleEditUser, handleStatusToggle, handleDeleteUser, deleteLoading, router]);

  const handleAddUser = useCallback(() => {
    handleCreateUser();
  }, [handleCreateUser]);

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const verifiedUsers = users.filter(user => user.isVerified).length;
  const recentUsers = users.filter(user => {
    if (!user.createdAt) return false;
    const createdDate = new Date(user.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate > sevenDaysAgo;
  }).length;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      description: 'All registered users',
      icon: Users,
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      description: `${totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total`,
      icon: UserCheck,
    },
    {
      title: 'Verified Users',
      value: verifiedUsers.toString(),
      description: `${totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0}% verified`,
      icon: Shield,
    },
    {
      title: 'Recent Users',
      value: recentUsers.toString(),
      description: 'New this week',
      icon: UserPlus,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              User Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage all users in your application
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button onClick={handleAddUser} size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users by name, email, or code..."
        rowActions={rowActions}
        onAdd={handleAddUser}
        addButtonText="Add User"
      />
    </div>
  );
}
