'use client';

import { ThemeProvider } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminMain } from '@/components/layout/admin-main';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider>
      <ProtectedRoute>
        <Toaster position="top-right" richColors />
        <SidebarProvider>
          <div className="flex w-full h-screen">
            <AdminSidebar />
            
            <SidebarInset>
              <AdminHeader />
              <AdminMain>
                {children}
              </AdminMain>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
