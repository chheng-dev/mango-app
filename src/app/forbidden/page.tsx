'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, Home, User, Mail, AlertTriangle } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    setReturnUrl(searchParams.get('from'));
  }, [searchParams]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  const getPageDescription = (url: string | null) => {
    if (!url) return null;
    
    if (url.includes('/admin/system')) return 'Super Admin Dashboard';
    if (url.includes('/admin')) return 'Admin Dashboard';
    if (url.includes('/api/admin')) return 'Admin API';
    if (url.includes('/api/users')) return 'User Management API';
    if (url.includes('/api/roles')) return 'Role Management API';
    
    return 'Protected Resource';
  };

  const pageDescription = getPageDescription(returnUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-red-100">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Forbidden
            </h1>
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Error 403</span>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg mb-4">
              You don't have the required permissions to access this resource.
            </p>
            <p className="text-gray-500 text-sm">
              This usually means you need a higher role level or specific permissions. 
              Contact your administrator if you believe this is an error.
            </p>
          </div>

          {/* Attempted Resource Info */}
          {returnUrl && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldX className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {pageDescription || 'Protected Resource'}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">Attempted to access:</p>
                  <p className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border break-all">
                    {returnUrl}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleGoBack}
              variant="default" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleGoHome}
                variant="outline" 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>

              <Button 
                onClick={handleGoToProfile}
                variant="outline" 
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-gray-500 mb-3">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Need Help?</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                If you need access to this resource, please contact your system administrator 
                or check if your role has the required permissions.
              </p>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Check your current role and permissions in your profile settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
