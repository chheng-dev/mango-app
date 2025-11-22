'use client';

import { ChevronDown } from 'lucide-react';

interface SidebarHeaderProps {
  className?: string;
  user: any;
  isSuperAdmin?: boolean;
}

export function SidebarHeader({ className, user, isSuperAdmin }: SidebarHeaderProps) {
  return (
    <div className='p-4 border-b border-sidebar-border'>
      <div className='flex items-center gap-3'>
        <div className='h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0 shadow-sm'>
          <span className='text-sidebar-primary-foreground font-semibold text-lg'>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold text-sidebar-foreground truncate'>
            {user?.email || 'No Email Provided'}
          </p>
          <div className='flex items-center gap-2 mt-0.5'>
            <span className='text-xs text-muted-foreground bg-sidebar-accent px-1.5 py-0.5 rounded-md font-medium'>
              {user?.role?.name || 'User'}
            </span>
            {
              isSuperAdmin && (
                <span className='text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-md'>
                  Super Admin
                </span>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
