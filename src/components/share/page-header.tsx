import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  onBack?: () => void;
  onAction?: () => void;
  btnAction: string;
  title: string | undefined;
}

export function PageHeader({ onBack, onAction, btnAction, title }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 mb-3 border-b border-muted sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center">
        <ChevronLeft className="mr-2 h-6 w-6 cursor-pointer hover:text-primary transition-colors" onClick={onBack} />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div>
        <Button 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onAction) {
              onAction();
            }
          }}
          type="button"
          className="cursor-pointer"
        >
          <span className="text-xs">{btnAction}</span>
        </Button>
      </div>
    </div>
  );
}
