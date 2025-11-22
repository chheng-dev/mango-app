"use client"

import { HeaderComp } from "@/components/share/header-comp";
import { DataTable } from "@/components/ui/data-table";
import { useContactPersons } from "@/hooks/use-contact-person";
import { ContactPerson } from "@/lib/types/contactPerson";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, icons, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContactPersonsPage() {
  const router = useRouter();
  const { contactPersons } = useContactPersons();

  const columns: ColumnDef<ContactPerson>[] = [
    {
      accessorKey: 'cpCode',
      header: 'Code',
    },
    { 
      accessorKey: 'cpName',
      header: 'Name',
    },
    {
      accessorKey: 'cEmail',
      header: 'Email',
    },
    { 
      accessorKey: 'cTel',
      header: 'Telephone',
    },
    {
      accessorKey: 'cCode',
      header: 'Customer Code',
    },
    {
      accessorKey: 'cStatus',
      header: 'Status',
    },
    {
      accessorKey: 'cpCreatedAt',
      header: 'Created At',
    },
    {
      accessorKey: 'cpLastUpdateAt',
      header: 'Last Updated At',
    },
    {
      accessorKey: 'cpLastUpdateBy',
      header: 'Last Updated By',
    }, 
    {
      accessorKey: 'cpCreatedBy',
      header: 'Created By',
    }
  ]

  const bulkActions = {
    actions: [
      {
        label: 'Activate',
        icon: CheckCircle,
        variant: 'success' as const,
      },
      {
        label: 'Deactivate',
        icon: XCircle,
        variant: 'warning' as const,
      },
      {
        label: 'Delete',
        icon: XCircle,
        variant: 'destructive' as const,
      }
    ]
  }

  const handleRowClick = (contactPerson: any, event?: React.MouseEvent) => {
    router.push(`/admin/contact-persons/edit?cpCode=${contactPerson.cpCode}`);
  }

  return (
    <div className="space-y-6 @container mx-auto">
      <HeaderComp
        onAdd={() => {
          router.push('/admin/contact-persons/create');
        }}
        title="Contact Persons"
        description="Manage your contact persons"
        btnAdd="Add Contact Person"
      />
      <DataTable 
        data={contactPersons as any}
        columns={columns}
        searchPlaceholder="Search contact persons by code, name, or customer code..."
        isLoading={false}
        onRowClick={handleRowClick}
        bulkActions={bulkActions as any}
        emptyState={{
          icon: icons.AArrowDown,
          title: "No Contact Persons Found",
          description: "Create a new contact person to get started.",
        }}
      />
    </div>
  );
} 