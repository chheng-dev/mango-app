'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Star,
  Settings2,
  Database,
  FileX,
  Inbox
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | 'actions';
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  actions?: DataTableAction<T>[];
  rowActions?: DataTableAction<T>[];
  filters?: {
    key: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  onAdd?: () => void;
  addButtonText?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchable = true,
  searchPlaceholder = "Search...",
  actions = [],
  rowActions = [],
  filters = [],
  onAdd,
  addButtonText = "Add Item",
  isLoading = false,
  skeletonRows = 5,
  emptyTitle = "No data available",
  emptyDescription = "There are no items to display at the moment.",
  emptyIcon: EmptyIcon = Database
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Filter and search data
  const filteredData = data.filter((item) => {
    // Search filter
    const searchMatch = !searchTerm || Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Additional filters
    const filterMatch = Object.entries(selectedFilters).every(([key, value]) => {
      if (!value) return true;
      return String(item[key]).toLowerCase() === value.toLowerCase();
    });

    return searchMatch && filterMatch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setSelectedFilters(current => ({
      ...current,
      [filterKey]: value
    }));
  };

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {onAdd && (
              <Button onClick={onAdd}>
                {addButtonText}
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                <Filter className="h-4 w-4" />
                Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFilterChange('status', '')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('status', 'active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('status', 'inactive')}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                Category
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFilterChange('category', '')}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('category', 'electronics')}>
                Electronics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('category', 'beauty')}>
                Beauty
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price Range Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                Price: $100-$200
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Price</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>$0 - $100</DropdownMenuItem>
              <DropdownMenuItem>$100 - $200</DropdownMenuItem>
              <DropdownMenuItem>$200 - $500</DropdownMenuItem>
              <DropdownMenuItem>$500+</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Columns Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={isLoading}>
                <Settings2 className="h-4 w-4" />
                Columns
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.filter(col => col.key !== 'actions').map((column) => (
                <DropdownMenuItem key={String(column.key)}>
                  <input type="checkbox" className="mr-2" defaultChecked />
                  {column.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                {columns.map((column) => (
                  <TableHead 
                    key={String(column.key)}
                    className={`${column.width || ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    onClick={() => column.sortable && column.key !== 'actions' && handleSort(column.key as keyof T)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {column.sortable && sortConfig.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: skeletonRows }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={`skeleton-${index}-${String(column.key)}`}>
                        {column.key === 'actions' ? (
                          <Skeleton className="h-8 w-8 rounded" />
                        ) : (
                          <Skeleton className="h-4 w-full max-w-[200px]" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sortedData.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="py-16">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="rounded-full bg-muted p-6">
                        <EmptyIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-foreground">
                          {emptyTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {emptyDescription}
                        </p>
                      </div>
                      {onAdd && (
                        <Button onClick={onAdd} className="mt-4">
                          {addButtonText}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Actual data rows
                sortedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.key === 'actions' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {rowActions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(item)}
                                  className={action.variant === 'destructive' ? 'text-destructive' : ''}
                                >
                                  {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : column.render ? (
                          column.render(item[column.key], item)
                        ) : (
                          String(item[column.key] || '')
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${sortedData.length} of ${data.length} results`
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isLoading}>
              {isLoading ? <Skeleton className="h-4 w-16" /> : "Previous"}
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading}>
              {isLoading ? <Skeleton className="h-4 w-12" /> : "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
