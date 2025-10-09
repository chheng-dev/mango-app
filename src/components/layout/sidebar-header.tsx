'use client';

import { ChevronDown } from 'lucide-react';

interface SidebarHeaderProps {
  className?: string;
}

export function SidebarHeader({ className }: SidebarHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
          <span className="text-sm font-bold">S</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-base font-medium text-gray-900">Shop</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
