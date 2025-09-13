'use client';

import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

export default function Page() {
  
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Home Page</h1>
      
      <LogoutButton />
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Test Links:</h2>
        <div className="space-x-4">
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Admin (Protected)
          </Link>
        </div>
      </div>
    </div>
  );
}