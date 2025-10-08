'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ComboboxOption {
  id: number | string;
  name: string;
  description?: string;
  disabled?: boolean;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface MultiSelectComboboxProps {
  options: ComboboxOption[];
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxDisplayItems?: number;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  showClearAll?: boolean;
  showSelectedBadges?: boolean;
}

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found",
  maxDisplayItems = 2,
  disabled = false,
  loading = false,
  className,
  showClearAll = true,
  showSelectedBadges = true,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOptions = options.filter(option => value.includes(option.id));
  
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (optionId: number | string) => {
    if (disabled) return;
    
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    
    onChange(newValue);
  };

  const handleRemove = (optionId: number | string) => {
    if (disabled) return;
    onChange(value.filter(id => id !== optionId));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const getButtonText = () => {
    if (value.length === 0) {
      return placeholder;
    }
    if (value.length <= maxDisplayItems) {
      return selectedOptions.map(option => option.name).join(', ');
    }
    return `${value.length} item${value.length === 1 ? '' : 's'} selected`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">
              {loading ? "Loading..." : getButtonText()}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-64 overflow-y-auto">
            {/* Search and Clear */}
            <div className="p-2 border-b space-y-2">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8"
              />
              {showClearAll && value.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear all ({value.length})
                </Button>
              )}
            </div>
            
            {/* Options List */}
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  {searchTerm ? `No items found matching "${searchTerm}"` : emptyText}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !option.disabled && handleToggle(option.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={option.disabled}
                        onCheckedChange={() => !option.disabled && handleToggle(option.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.name}</span>
                          {option.badge && (
                            <Badge 
                              variant={option.badge.variant || "secondary"}
                              className="text-xs"
                            >
                              {option.badge.text}
                            </Badge>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {option.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Items Display */}
      {showSelectedBadges && selectedOptions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Selected ({selectedOptions.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(option.id);
                  }}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}