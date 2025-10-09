'use client';

import { useState } from 'react';
import { useAuth } from '@/store/authStore';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import Link from 'next/link';
import { ChevronDown, User, LogOut, Palette, Bell } from 'lucide-react';

interface UserProfileDropdownProps {
  className?: string;
}

export function UserProfileDropdown({ className }: UserProfileDropdownProps) {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserPermissions();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
      >
        <div className="h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name || 'User'}
          </p>
          {isSuperAdmin && (
            <p className="text-xs text-gray-500">Administrator</p>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
          isDropdownOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
          <Link
            href="/admin/profile"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/admin/preferences"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Palette className="h-4 w-4" />
            Preferences
          </Link>
          <Link
            href="/admin/notifications"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Link>
          <div className="border-t border-gray-200 my-1" />
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              setIsDropdownOpen(false);
              // Add logout logic here
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
