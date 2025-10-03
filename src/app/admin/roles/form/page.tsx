'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleForm } from '@/components/forms/RoleForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RoleFormExample() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get mode and roleId from URL params
  const mode = searchParams.get('mode') as 'create' | 'edit' || 'create';
  const roleId = searchParams.get('roleId');

  const [isFormVisible, setIsFormVisible] = useState(true);

  const handleSuccess = (role: any) => {
    console.log('Role saved successfully:', role);
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
  };

  if (!isFormVisible) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            {mode === 'create' ? 'Role Created Successfully!' : 'Role Updated Successfully!'}
          </h2>
          <p className="text-muted-foreground mb-6">
            The role has been {mode === 'create' ? 'created' : 'updated'} and is now available.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => setIsFormVisible(true)}
              variant="outline"
            >
              {mode === 'create' ? 'Create Another Role' : 'Edit Again'}
            </Button>
            <Button onClick={() => router.push('/admin/roles')}>
              View All Roles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {mode === 'create' ? 'Create New Role' : 'Edit Role'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' 
              ? 'Create a new role with specific permissions and settings.'
              : 'Modify the role details and permissions.'
            }
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg">
        <RoleForm
          roleId={roleId || undefined}
          mode={mode}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>

      {/* Help Text */}
      <div className="bg-muted/50 border rounded-lg p-4">
        <h3 className="font-medium mb-2">Form Features:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Real-time validation</strong> with Zod schema</li>
          <li>• <strong>Auto-generated slugs</strong> from role names (can be manually edited)</li>
          <li>• <strong>TanStack Query integration</strong> for data fetching and caching</li>
          <li>• <strong>Optimistic updates</strong> with automatic cache invalidation</li>
          <li>• <strong>Permission management</strong> with expand/collapse functionality</li>
          <li>• <strong>Toast notifications</strong> for success/error feedback</li>
          <li>• <strong>Loading states</strong> for better user experience</li>
        </ul>
      </div>
    </div>
  );
}