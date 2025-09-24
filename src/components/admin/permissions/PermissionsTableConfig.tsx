import { useMemo } from 'react';
import { Column, DataTableAction } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Shield, 
  ShieldCheck, 
  Key, 
  Edit,
  Trash2,
  Eye,
  Settings,
  Database,
  Users,
  Lock
} from 'lucide-react';
import { Permission } from '@/lib/api/permissionApiService';

interface UsePermissionsTableConfigProps {
  onViewPermission: (permission: Permission) => void;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (permission: Permission) => void;
  deleteLoading: number | null;
}

export function usePermissionsTableConfig({
  onViewPermission,
  onEditPermission,
  onDeletePermission,
  deleteLoading
}: UsePermissionsTableConfigProps) {
  
  const columns: Column<Permission>[] = useMemo(() => [
    {
      key: 'name',
      title: 'Permission Details',
      sortable: true,
      render: (value, permission) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
              {getResourceIcon(permission.resource)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {permission.name}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {permission.slug}
              </code>
            </div>
            {permission.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                {permission.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'resource',
      title: 'Resource',
      sortable: true,
      render: (value, permission) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="capitalize font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
          >
            {getResourceIcon(permission.resource)}
            <span className="ml-1">{permission.resource}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      sortable: true,
      render: (value, permission) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant={getActionVariant(permission.action)}
            className="capitalize font-medium"
          >
            {getActionIcon(permission.action)}
            <span className="ml-1">{permission.action}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
    },
  ], []);

  const actions: DataTableAction<Permission>[] = useMemo(() => [
    {
      label: 'View',
      icon: Eye,
      onClick: onViewPermission,
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: onEditPermission,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDeletePermission,
      variant: 'destructive',
      loading: (permission: Permission) => deleteLoading === permission.id,
      disabled: (permission: Permission) => deleteLoading === permission.id
    },
  ], [onViewPermission, onEditPermission, onDeletePermission, deleteLoading]);

  return {
    columns,
    actions,
  };
}

// Helper function to get resource icon
function getResourceIcon(resource: string) {
  switch (resource.toLowerCase()) {
    case 'user':
      return <Users className="h-4 w-4" />;
    case 'role':
      return <Shield className="h-4 w-4" />;
    case 'permission':
      return <Key className="h-4 w-4" />;
    case 'system':
      return <Settings className="h-4 w-4" />;
    case 'profile':
      return <Users className="h-4 w-4" />;
    default:
      return <Database className="h-4 w-4" />;
  }
}

// Helper function to get action icon
function getActionIcon(action: string) {
  switch (action.toLowerCase()) {
    case 'read':
      return <Eye className="h-3 w-3" />;
    case 'create':
      return <Plus className="h-3 w-3" />;
    case 'update':
      return <Edit className="h-3 w-3" />;
    case 'delete':
      return <Trash2 className="h-3 w-3" />;
    case 'admin':
      return <ShieldCheck className="h-3 w-3" />;
    default:
      return <Lock className="h-3 w-3" />;
  }
}

// Helper function to get action badge variant
function getActionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  switch (action.toLowerCase()) {
    case 'read':
      return 'outline';
    case 'create':
      return 'default';
    case 'update':
      return 'secondary';
    case 'delete':
      return 'destructive';
    case 'admin':
      return 'default';
    default:
      return 'outline';
  }
}

// Fix import for Plus icon
import { Plus } from 'lucide-react';
