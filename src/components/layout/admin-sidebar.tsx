'use client';

import { Sidebar } from './sidebar';

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col">
      <Sidebar />
    </aside>
  );
}