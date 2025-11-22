"use client";
import { HeaderComp } from "@/components/share/header-comp";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { icons } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const router = useRouter();
  const columns: ColumnDef<any>[] = [];

  const handleRowClick = (row: any) => {
    router.push(`/admin/customers/${row.original.cCode}`);
  }

  const bulkActions = {
    actions: [
      {
        label: 'Activate',
        // icon: CheckCircle,
        variant: 'success' as const,
        onClick: async (selectedCustomers: any[]) => {
          // Implement activation logic here
        }
      },
      {
        label: 'Deactivate',
        // icon: XCircle,
        variant: 'danger' as const,
        onClick: async (selectedCustomers: any[]) => {
          // Implement deactivation logic here
        }
      }
    ]
  };  

  return (
    <div className="space-y-6 @container mx-auto">
      <HeaderComp
        onAdd={() => {
          router.push('/admin/customers/create');
        }}
        title="Customers"
        description="Manage your customers"
        btnAdd="Add Customer"
      />
      <DataTable
        data={[]}
        columns={columns}
        searchPlaceholder="Search customers by code, name, or customer code..."
        isLoading={false}
        onRowClick={handleRowClick}
        bulkActions={bulkActions as any}
        emptyState={{
          icon: icons.UsersRound,
          title: "No Customers Found",
          description: "Create a new customer to get started.",
        }}
      />
    </div>
  );
}