import { useMemo } from 'react';
import { Column, DataTableAction } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Edit,
  Trash2,
  Eye,
  UserPlus,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Role } from '@/lib/api/roleApiService';

interface UseRolesTableConfigProps {
  onViewRole: (role: Role) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onAssignUsers: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  deleteLoading: number | null;
}

export function useRolesTableConfig({
  onViewRole,
  onEditRole,
  onDeleteRole,
  onAssignUsers,
  onManagePermissions,
  deleteLoading
}: UseRolesTableConfigProps) {
  
  const columns: Column<Role>[] = useMemo(() => [
    {
      key: 'name',
      title: 'Role Details',
      sortable: true,
      render: (value, role) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold">
              {role.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'R'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {role.name}
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-gray-50 dark:bg-gray-800">
                {role.slug}
              </Badge>
            </div>
            {role.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {role.description}
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
      render: (value, role) => (
        <div className="space-y-2">
          <div>
            {role.isActive ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                <Shield className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
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

  // Define row actions
  const rowActions: DataTableAction<Role>[] = useMemo(() => [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onViewRole
    },
    {
      label: 'Edit Role',
      icon: Edit,
      onClick: onEditRole
    },
    {
      label: 'Assign to Users',
      icon: UserPlus,
      onClick: onAssignUsers,
      variant: 'default'
    },
    {
      label: 'Manage Permissions',
      icon: Settings,
      onClick: onManagePermissions,
      variant: 'default'
    },
    {
      label: 'Delete Role',
      icon: Trash2,
      variant: 'destructive',
      onClick: onDeleteRole
    }
  ], [onViewRole, onEditRole, onDeleteRole, onAssignUsers, onManagePermissions]);

  return {
    columns,
    rowActions
  };
}
