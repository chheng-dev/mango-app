import { Button } from '@/components/ui/button';
import { 
  Plus,
  Grid2X2PlusIcon
} from 'lucide-react';

interface HeaderCompProps {
  onAdd: () => void;
  onExport?: () => void;
  title: string;
  description: string;
  btnAdd: string;
}

export function HeaderComp({ onAdd, onExport, title, description, btnAdd }: HeaderCompProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b px-4">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm md:text-xl text-foreground">
            {title}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Grid2X2PlusIcon className="h-4 w-4 mr-1" />
          <span className='text-xs'>Export</span>
        </Button>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          <span className='text-xs'>{btnAdd}</span>
        </Button>
      </div>
    </div>
  );
}
