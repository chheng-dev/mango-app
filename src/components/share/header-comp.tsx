import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Plus,
  Filter,
  Download
} from 'lucide-react';

interface HeaderCompProps {
  onAdd: () => void;
  onFilter?: () => void;
  onExport?: () => void;
  title: string;
  description: string;
  btnAdd: string;
}

export function HeaderComp({ onAdd, onFilter, onExport, title, description, btnAdd }: HeaderCompProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Shield className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {btnAdd}
        </Button>
      </div>
    </div>
  );
}
