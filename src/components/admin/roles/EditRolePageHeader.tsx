import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditRolePageHeaderProps {
  onBack: () => void;
}

export function EditRolePageHeader({ onBack }: EditRolePageHeaderProps) {
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Roles
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
      <p className="text-muted-foreground mt-2">
        Update role details and permissions
      </p>
    </div>
  );
}
