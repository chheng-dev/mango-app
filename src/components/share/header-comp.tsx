import { Button } from '@/components/ui/button';
import { 
  Plus,
  Grid2X2PlusIcon
} from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface HeaderCompProps {
  onAdd: () => void;
  onExport?: () => void;
  title: string;
  description?: string;
  btnAdd: string;
  requiresCreatePermission?: string;
  requiresExportPermission?: string;
}

export function HeaderComp({ onAdd, onExport, title, description, btnAdd, requiresCreatePermission, requiresExportPermission }: HeaderCompProps) {
  const { hasPermission } = useUserPermissions();
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm md:text-xl text-foreground">
            {title}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {
          requiresExportPermission && hasPermission([requiresExportPermission]) && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Grid2X2PlusIcon className="h-4 w-4 mr-1" />
              <span className='text-xs'>Export</span>
            </Button>
          )
        }
        {
          requiresCreatePermission && hasPermission([requiresCreatePermission]) && ( 
            <Button onClick={onAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              <span className='text-xs'>{btnAdd}</span>
            </Button>
          )
        }
      </div>
    </div>
  );
}
