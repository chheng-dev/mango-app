'use client';

import { ThemeProvider } from '@/contexts/theme-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminMain } from '@/components/layout/admin-main';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider>
      <ProtectedRoute>
        <Toaster position="top-right" richColors />
        <div className="flex h-screen bg-background text-primary">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <AdminMain>
              {children}
            </AdminMain>
          </div>
        </div>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
