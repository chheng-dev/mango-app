import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  AlertTriangle,
} from 'lucide-react';
import { Role } from '@/lib/api/roleApiService';
import { ColumnDef } from '@tanstack/react-table';
import { humanizeDate } from '@/lib/utils/date';

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
            </div>
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
      cell: ({ row }) => {
        return humanizeDate(row.getValue("createdAt"));
      },
    },
  ];

  return {
    columns,
  };
}
