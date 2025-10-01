'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  UserX, 
  Trash2, 
  Mail, 
  Shield, 
  AlertTriangle, 
  Users, 
  UserPlus,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Grid2X2PlusIcon,
  Plus
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/lib/api/userApiService';
import { toast } from "sonner";
import { ColumnDef } from '@tanstack/react-table';
import { HeaderComp } from '@/components/share/header-comp';

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

  // Bulk actions for DataTable
  const bulkActions = {
    actions: [
      {
        label: 'Activate',
        icon: CheckCircle,
        variant: 'success' as const,
        onClick: async (selectedUsers: User[]) => {
          await Promise.all(
            selectedUsers.map(user => updateUserStatus(user.id, true))
          );
          toast.success(`${selectedUsers.length} users activated successfully`);
        }
      },
      {
        label: 'Deactivate',
        icon: XCircle,
        variant: 'warning' as const,
        onClick: async (selectedUsers: User[]) => {
          const confirmMessage = `Deactivate ${selectedUsers.length} users?\n\nThis will prevent them from accessing the system.`;
          if (!window.confirm(confirmMessage)) return;
          
          await Promise.all(
            selectedUsers.map(user => updateUserStatus(user.id, false))
          );
          toast.success(`${selectedUsers.length} users deactivated successfully`);
        }
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive' as const,
        onClick: async (selectedUsers: User[]) => {
          const confirmMessage = `Delete ${selectedUsers.length} users?\n\nThis action cannot be undone.`;
          if (!window.confirm(confirmMessage)) return;
          
          await Promise.all(
            selectedUsers.map(user => deleteUser(user.id))
          );
          toast.success(`${selectedUsers.length} users deleted successfully`);
        }
      }
    ],
    getRowId: (user: User) => user.id.toString()
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'User Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold truncate text-foreground">
                {row.original.name || 'Unknown User'}
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {row.original.code}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {row.original.email}
            </div>
            {row.original.phoneNumber && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span>📞</span>
                <span>{row.original.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="space-y-2">
          <div>
            {row.original.isActive ? (
              <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
                <UserCheck className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <UserX className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
          
          {/* Verification Status */}
          <div>
            {row.original.isVerified ? (
              <Badge variant="default" className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20 dark:text-yellow-400 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Contact Info',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate max-w-[200px]">
              {row.original.email}
            </span>
          </div>
          {row.original.phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">📱</span>
              <span className="text-muted-foreground">
                {row.original.phoneNumber}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        const date = new Date(value);
        const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${isRecent ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
              {date.toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {isRecent && (
              <Badge variant="outline" className="text-xs mt-1 bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400">
                New
              </Badge>
            )}
          </div>
        );
      }
    },
  ];

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
      <HeaderComp 
        onAdd={handleAddUser}
        title="User Management"
        description="Manage your users effectively"
        btnAdd="Add User"
      />
      
      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users by name, email, or code..."
        bulkActions={bulkActions}
        isLoading={loading}
      />
    </div>
  );
}
