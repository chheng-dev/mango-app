'use client';

import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import { AdminMain } from './admin-main';

interface AdminLayoutContentProps {
  children: React.ReactNode;
}

export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  return (
    <div className="flex h-screen bg-background text-primary">
      {/* <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <AdminMain>
          {children}
        </AdminMain>
      </div> */}
    </div>
  );
}