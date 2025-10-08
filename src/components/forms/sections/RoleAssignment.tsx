'use client';

import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Shield } from 'lucide-react';
import { ComboboxOption, MultiSelectCombobox } from '@/components/ui/multi-select-combobox';

interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface RoleAssignmentProps {
  form: UseFormReturn<any>;
  mode: 'create' | 'edit';
}

export function RoleAssignment({ form, mode }: RoleAssignmentProps) {
  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ['roles', 'available'],
    queryFn: async () => {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
  });

  useEffect(() => {
    const currentRoles = form.getValues('roles');
    if (currentRoles === undefined || currentRoles === null) {
      form.setValue('roles', [], { shouldValidate: false });
    }
  }, [form]);

  const roles: Role[] = rolesResponse?.data || [];

  const roleOptions: ComboboxOption[] = roles.map(role => ({
    id: role.id,
    name: role.name,
    description: role.description || '',
    disabled: !role.isActive,
    badge: {
      text: role.isActive ? 'Active' : 'Inactive',
      variant: role.isActive ? 'default' : 'secondary',
    }
  }));

  const selectedRoles: number[] = form.watch('roles') || [];

  const handleRolesChange = (newRoleIds: (number | string)[]) => {
    const roleIds = newRoleIds.map(id => Number(id));
    form.setValue(
      'roles', roleIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    form.trigger('roles');
  }, [form, selectedRoles]);

  return (
    <FormField
      control={form.control}
      name="roles"
      render={() => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Assignment
            {selectedRoles.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedRoles.length} selected
              </Badge>
            )}
          </FormLabel>
          
          <FormControl>
            <MultiSelectCombobox
              options={roleOptions}
              value={selectedRoles}
              onChange={handleRolesChange}
              placeholder='Select roles...'
              emptyText='No roles found'
              loading={isLoading}
              maxDisplayItems={2}
              showClearAll={true}
              showSelectedBadges={true}
            />
          </FormControl>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
