'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

const Select = ({ value, onValueChange, disabled, children }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { disabled } = React.useContext(SelectContext);
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

const SelectContent = ({ className, children }: SelectContentProps) => {
  return (
    <div
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, onSelect, ...props }, ref) => {
    const { onValueChange } = React.useContext(SelectContext);
    
    const handleSelect = () => {
      onValueChange?.(value);
      onSelect?.(value);
    };

    return (
      <div
        ref={ref}
        role="option"
        onClick={handleSelect}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
