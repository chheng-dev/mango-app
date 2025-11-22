'use client';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  UserX, 
  Trash2, 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/lib/types/user';
import { toast } from "sonner";
import { ColumnDef } from '@tanstack/react-table';
import { HeaderComp } from '@/components/share/header-comp';
import { usePagePermission } from '@/hooks/usePagePermission';

export default function UsersPage() {
  // Check permissions and redirect if unauthorized
  const { hasAccess, isLoading: permissionLoading } = usePagePermission({
    resource: 'user',
    action: 'read',
    redirectTo: '/en/unauthorized'
  });

  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    // This shouldn't be reached due to redirect, but safety check
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Access denied</div>
      </div>
    );
  }

  const router = useRouter();
  const {
    users,
    loading,
    error,
    deleteUser,
    updateUserStatus,
    clearError,
  } = useUsers();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateUser = useCallback(() => {
    router.push('/en/admin/users/create');
  }, [router]);

  const handleEditUser = useCallback((user: User) => {
    router.push(`/en/admin/users/edit?id=${user.id}`);
  }, [router]);

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
                {row.original.name}
              </div>
            </div>
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
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge>
          {row.original.role ? row.original.role : 'No Role Assigned'}
        </Badge>
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

  return (
    <div className="space-y-6">
      <HeaderComp 
        onAdd={handleAddUser}
        title="User Management"
        description="Manage your users effectively"
        btnAdd="Add User"
      />
      
      <DataTable
        data={users as any[]}
        columns={columns}
        searchPlaceholder="Search users by name, email, or code..."
        bulkActions={bulkActions}
        onRowClick={handleEditUser}
        isLoading={loading}
      />
    </div>
  );
}