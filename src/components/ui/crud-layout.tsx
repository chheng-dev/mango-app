import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export interface CrudPageProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
}

export interface ListPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'verified' | 'unverified' | 'new' | 'draft' | 'published' | 'in-stock' | 'out-of-stock';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

// Main CRUD Page Layout
export function CrudPageLayout({ 
  title, 
  subtitle, 
  backUrl, 
  children, 
  actions,
  breadcrumbs,
  searchPlaceholder = "Search...",
  showSearch = false,
  showFilters = false,
  onSearch,
  onFilter
}: CrudPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Modern Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              {backUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {/* Search and Filters Row */}
          {(showSearch || showFilters) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                {showFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onFilter}
                    className="h-9 px-4 border-gray-300 dark:border-gray-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                )}
              </div>
              
              {showSearch && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="w-full h-9 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

// Modern List Page Layout (like the products page in screenshot)
export function ListPageLayout({ 
  title, 
  subtitle, 
  children, 
  actions,
  searchPlaceholder = "Search by: Name, Brand, etc.",
  showSearch = true,
  showFilters = true,
  onSearch,
  onFilter
}: ListPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Clean Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {/* Modern Search and Filter Bar */}
          {(showSearch || showFilters) && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
              <div className="flex items-center gap-3">
                <select className="h-10 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All products</option>
                  <option>Active products</option>
                  <option>Inactive products</option>
                </select>
                
                {showFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onFilter}
                    className="h-10 px-4 border-gray-300 dark:border-gray-600"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                )}
              </div>
              
              {showSearch && (
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="w-full h-10 pl-12 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}

// Modern Form Section Component
export function FormSection({ 
  title, 
  description, 
  children, 
  className,
  collapsible = false,
  defaultOpen = true 
}: FormSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Card className={cn("border-0 shadow-sm bg-white dark:bg-gray-900", className)}>
      <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 w-8 p-0 rounded-lg"
            >
              {isOpen ? '−' : '+'}
            </Button>
          )}
        </div>
      </CardHeader>
      {(!collapsible || isOpen) && (
        <CardContent className="p-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// Modern Status Badge Component
export function StatusBadge({ status, size = 'md', variant = 'default' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 h-6',
    md: 'text-sm px-3 py-1.5 h-7',
    lg: 'text-base px-4 py-2 h-8'
  };

  const statusConfig = {
    active: {
      className: variant === 'minimal' 
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' 
        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      label: 'Active'
    },
    inactive: {
      className: variant === 'minimal'
        ? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-700'
        : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      label: 'Inactive'
    },
    verified: {
      className: variant === 'minimal'
        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
        : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      label: 'Verified'
    },
    unverified: {
      className: variant === 'minimal'
        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      label: 'Unverified'
    },
    new: {
      className: variant === 'minimal'
        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800'
        : 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
      label: 'New'
    },
    draft: {
      className: variant === 'minimal'
        ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800'
        : 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
      label: 'Draft'
    },
    published: {
      className: variant === 'minimal'
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'
        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      label: 'Published'
    },
    'in-stock': {
      className: variant === 'minimal'
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'
        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      label: 'In stock'
    },
    'out-of-stock': {
      className: variant === 'minimal'
        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
        : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      label: 'Out of stock'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border rounded-full inline-flex items-center justify-center',
        sizeClasses[size],
        config.className
      )}
    >
      {config.label}
    </Badge>
  );
}

// Modern Form Field Component
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, help, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-500 text-lg leading-none">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
      {help && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {help}
        </p>
      )}
    </div>
  );
}

// Modern Action Button Group
export interface ActionButtonGroupProps {
  primaryLabel?: string;
  primaryAction?: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  primaryIcon?: React.ReactNode;
  secondaryLabel?: string;
  secondaryAction?: () => void;
  secondaryVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  secondaryIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function ActionButtonGroup({
  primaryLabel = 'Save',
  primaryAction,
  primaryLoading = false,
  primaryDisabled = false,
  primaryIcon = <Save className="h-4 w-4" />,
  secondaryLabel = 'Cancel',
  secondaryAction,
  secondaryVariant = 'outline',
  secondaryIcon,
  children,
  className
}: ActionButtonGroupProps) {
  return (
    <div className={cn("flex items-center justify-end gap-4 pt-8 border-t border-gray-100 dark:border-gray-800", className)}>
      {children}
      {secondaryAction && (
        <Button
          variant={secondaryVariant}
          onClick={secondaryAction}
          disabled={primaryLoading}
          className="h-10 px-6 font-medium"
        >
          {secondaryIcon && <span className="mr-2">{secondaryIcon}</span>}
          {secondaryLabel}
        </Button>
      )}
      {primaryAction && (
        <Button
          onClick={primaryAction}
          disabled={primaryDisabled || primaryLoading}
          className="h-10 px-8 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {primaryLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {primaryIcon}
              {primaryLabel}
            </div>
          )}
        </Button>
      )}
    </div>
  );
}

// Modern Data Table Component
export interface DataTableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }>;
  data: Array<Record<string, any>>;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function DataTable({ columns, data, onSort, className }: DataTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newDirection = sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                    column.width && `w-${column.width}`,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
