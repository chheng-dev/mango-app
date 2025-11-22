"use client";
import { HeaderComp } from "@/components/share/header-comp";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

export default function EmployeesPage() {
  const handleAddUser = () => {}

  const handleEditUser = (user: any) => {}

  const columns: ColumnDef<any>[] = [
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

  const bulkActions = {
    actions: [
      
    ]
  }

  return (
    <div className="space-y-6">
      <HeaderComp
        onAdd={handleAddUser}
        title="Employee Management"
        description="Manage your employees effectively"
        btnAdd="Add Employee"
      />
      
      <DataTable
        data={[]}
        columns={columns}
        searchPlaceholder="Search users by name, email, or code..."
        bulkActions={bulkActions}
        onRowClick={handleEditUser}
        isLoading={false}
      />
    </div>
  );
}
