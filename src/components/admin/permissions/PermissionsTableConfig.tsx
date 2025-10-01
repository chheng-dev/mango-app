import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  Plus
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
  
  const columns: ColumnDef<Permission>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Permission Details',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-foreground truncate">
                {row.original.name}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {row.original.slug}
              </code>
            </div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground mt-1 truncate">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'resource',
      header: 'Resource',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="capitalize font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
          >
            {getResourceIcon(row.original.resource)}
            <span className="ml-1">{row.original.resource}</span>
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge 
            variant={getActionVariant(row.original.action)}
            className="capitalize font-medium"
          >
            {getActionIcon(row.original.action)}
            <span className="ml-1">{row.original.action}</span>
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
    },
  ], []);

  return {
    columns,
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


