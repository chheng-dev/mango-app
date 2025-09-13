'use client';

import { ThemeProvider } from '@/contexts/theme-context';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import HeaderSection from './layouts/header-section';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-50 h-16 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/75">
          <div className="flex h-full items-center gap-4 px-4 lg:px-6">
            <MobileNav />
            <div className="flex-1 min-w-0">
              <HeaderSection />
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <div className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
              <div className="space-y-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider>
      <ProtectedRoute>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
