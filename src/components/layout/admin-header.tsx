'use client';

import HeaderSection from '@/app/[locale]/admin/layouts/header-section';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from './theme-toggle';

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-border">
      <div className="flex h-full items-center gap-4 px-4 lg:px-6">
        <MobileNav />
        <div className="flex-1 min-w-0">
          <HeaderSection />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}