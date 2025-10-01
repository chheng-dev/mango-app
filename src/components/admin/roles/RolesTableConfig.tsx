import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  AlertTriangle,
} from 'lucide-react';
import { Role } from '@/lib/api/roleApiService';
import { ColumnDef } from '@tanstack/react-table';

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
  
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Role Details',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-semibold text-foreground truncate">
                {row.original.name}
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {row.original.slug}
              </Badge>
            </div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground truncate">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row } : any) => (
        <div className="space-y-2">
          <div>
            {row.original.isActive ? (
              <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
                <Shield className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: (row: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {row.permissions?.length || 0} permissions
            </span>
          </div>
          {row.permissions && row.permissions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {row.permissions.slice(0, 3).map((permission: any) => (
                <Badge key={permission.id} variant="secondary" className="text-xs">
                  {permission.slug}
                </Badge>
              ))}
              {row.permissions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{row.permissions.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'userCount',
      header: 'Users',
      cell: (row: any) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.userCount || 0}</span>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: (row: any) => {
          const date = new Date(row.createdAt);
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
    {
      accessorKey: 'actions',
      header: '',
    }
  ];

  // Define row actions
  // const rowActions: DataTableAction<Role>[] = useMemo(() => [
  //   {
  //     label: 'View Details',
  //     icon: Eye,
  //     onClick: onViewRole
  //   },
  //   {
  //     label: 'Edit Role',
  //     icon: Edit,
  //     onClick: onEditRole
  //   },
  //   {
  //     label: 'Assign to Users',
  //     icon: UserPlus,
  //     onClick: onAssignUsers,
  //     variant: 'default'
  //   },
  //   {
  //     label: 'Manage Permissions',
  //     icon: Settings,
  //     onClick: onManagePermissions,
  //     variant: 'default'
  //   },
  //   {
  //     label: 'Delete Role',
  //     icon: Trash2,
  //     variant: 'destructive',
  //     onClick: onDeleteRole
  //   }
  // ], [onViewRole, onEditRole, onDeleteRole, onAssignUsers, onManagePermissions]);

  return {
    columns,
    // rowActions
  };
}
