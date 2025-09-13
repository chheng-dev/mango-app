'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export function AccessDenied() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Access Denied</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You need to be authenticated to access the admin dashboard.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
