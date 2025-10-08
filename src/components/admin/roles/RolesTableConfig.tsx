import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  AlertTriangle,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { humanizeDate } from '@/lib/utils/date';

export function useRolesTableConfig() {

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
      accessorKey: 'permissionCount',
      header: 'Permissions',
      cell: ({ row }: any) => {        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {row.original.permissionCount} permissions
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'usersCount',
      header: 'Users',
      cell: ({ row }: any) => {        
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {row.original.userCount}
            </span>
          </div>
        );
      }
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
