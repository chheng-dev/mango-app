'use client';

import { useAuth } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const { logout, user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-gray-100 rounded">
        <p>Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 rounded space-y-2">
      <p>Logged in as: {user?.email}</p>
      <Button onClick={logout} variant="destructive">
        Logout
      </Button>
    </div>
  );
}
