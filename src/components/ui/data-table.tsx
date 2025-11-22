"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type CellContext,
  type SortingState,
} from "@tanstack/react-table"
import React, { useEffect, useState, useCallback } from "react"
import { Search, ChevronUp, ChevronDown, MoreHorizontal, Calendar, SlidersHorizontal, X, CheckCircle, XCircle, Trash2, SlidersHorizontalIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent } from "./card"


type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  actions?: (row: TData) => React.ReactNode;
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onSearch?: (search: string) => void
  searchValue?: string
  searchPlaceholder?: string
  filters?: {
    key: string
    label: string
    options: { label: string; value: string }[]
    value?: string
    onChange?: (value: string) => void
  }[]
  title?: string
  description?: string
  timeFilter?: {
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
  }
  showFilter?: {
    value: string
    onChange: (value: string) => void
    options: { label: string; value: string }[]
  }
  emptyState?: {
    icon?: React.ComponentType<{ className?: string }>
    title?: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  onRowClick?: (row: TData, event: React.MouseEvent) => void
  rowClickable?: boolean,
  isSearchEnabled?: boolean
  // Bulk Actions
  bulkActions?: {
    actions: {
      label: string
      icon?: React.ComponentType<{ className?: string }>
      onClick: (selectedRows: TData[]) => void | Promise<void>
      variant?: 'default' | 'success' | 'warning' | 'destructive'
      requiresConfirmation?: boolean
      confirmTitle?: string
      confirmMessage?: string
      confirmButtonText?: string
    }[]
    onSelectionChange?: (selectedRows: TData[]) => void
    getRowId?: (row: TData) => string | number
  }
}

export function DataTable<TData, TValue>({ 
  columns, 
  data, 
  isLoading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSearch,
  searchValue = "",
  searchPlaceholder = "Search...",
  filters = [],
  title,
  description,
  actions,
  timeFilter,
  showFilter,
  emptyState,
  onRowClick,
  rowClickable = false,
  isSearchEnabled = true,
  bulkActions
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedRows, setSelectedRows] = useState<TData[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<any>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState({ left: false, right: false })
  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const checkScrollPosition = useCallback(() => {
    const container = tableContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const isScrollable = scrollWidth > clientWidth
    
    setShowScrollIndicator({
      left: isScrollable && scrollLeft > 10,
      right: isScrollable && scrollLeft < scrollWidth - clientWidth - 10
    })
  }, [])

  useEffect(() => {
    checkScrollPosition()
    const container = tableContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [checkScrollPosition, data])

  useEffect(() => {
    if (pagination) {
      setPageIndex(pagination.page - 1) 
      setPageSize(pagination.limit)
    }
  }, [pagination?.page, pagination?.limit])

  useEffect(() => {
    setGlobalFilter(searchValue)
  }, [searchValue])

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value)
    onSearch?.(value)
  }

  // Bulk actions handlers
  const getRowId = (row: TData) => {
    if (bulkActions?.getRowId) {
      return bulkActions.getRowId(row)
    }
    // Default: try to get id property
    return (row as any)?.id || JSON.stringify(row)
  }

  const handleSelectRow = useCallback((row: TData, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelection = checked 
        ? [...prev, row]
        : prev.filter(r => getRowId(r) !== getRowId(row))
      
      bulkActions?.onSelectionChange?.(newSelection)
      return newSelection
    })
  }, [bulkActions])

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? [...data] : []
    setSelectedRows(newSelection)
    bulkActions?.onSelectionChange?.(newSelection)
  }, [data, bulkActions])

  const handleBulkAction = useCallback(async (action: any) => {
    if (selectedRows.length === 0) return
    
    // Check if this is a destructive action that needs confirmation
    if (action.variant === 'destructive' || action.requiresConfirmation) {
      setPendingAction(action)
      setShowConfirmModal(true)
      return
    }
    
    // Execute non-destructive actions immediately
    setBulkActionLoading(true)
    try {
      await action.onClick(selectedRows)
      setSelectedRows([])
      bulkActions?.onSelectionChange?.([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }, [selectedRows, bulkActions])

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction || selectedRows.length === 0) return
    
    setBulkActionLoading(true)
    setShowConfirmModal(false)
    
    try {
      await pendingAction.onClick(selectedRows)
      setSelectedRows([])
      bulkActions?.onSelectionChange?.([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setBulkActionLoading(false)
      setPendingAction(null)
    }
  }, [selectedRows, bulkActions, pendingAction])

  const handleCancelAction = useCallback(() => {
    setShowConfirmModal(false)
    setPendingAction(null)
  }, [])

  const isRowSelected = useCallback((row: TData) => {
    return selectedRows.some(r => getRowId(r) === getRowId(row))
  }, [selectedRows])

  const tableColumns = [
    // Add selection column if bulk actions are enabled
    ...(bulkActions ? [{
      id: 'select',
      header: ({ table }: any) => {
        const isAllSelected = selectedRows.length === data.length && data.length > 0;
        const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;
        
        return (
          <div className="flex items-center" data-prevent-row-click>
            <Checkbox
              checked={isAllSelected}
              // @ts-ignore
              indeterminate={isIndeterminate}
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
              aria-label="Select all rows"
              className={`data-[state=checked]:bg-primary data-[state=checked]:border-primary ${
                isIndeterminate ? 'data-[state=unchecked]:bg-primary/20 data-[state=unchecked]:border-primary' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
      cell: ({ row }: any) => {
        const isSelected = isRowSelected(row.original);
        
        return (
          <div className="flex items-center" data-prevent-row-click>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleSelectRow(row.original, !!checked)}
              aria-label={`Select row`}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 40,
    }] : []),
    ...columns,
    ...(actions ? [{
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: (context: CellContext<TData, any>) => {
        const row = context.row;
        return (
          <div className="text-right" data-prevent-row-click onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions && actions(row.original)}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }] : [])
  ];
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!pagination,
    manualSorting: !!pagination,
    pageCount: pagination?.totalPages || 0,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      globalFilter,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize })
        setPageIndex(newState.pageIndex)
        setPageSize(newState.pageSize)
        
        if (onPageChange && newState.pageIndex !== pageIndex) {
          onPageChange(newState.pageIndex + 1) 
        }
        if (onLimitChange && newState.pageSize !== pageSize) {
          onLimitChange(newState.pageSize)
        }
      }
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  })

  const skeletonRows = Array.from({ length: pageSize }).map((_, rowIndex) => (
    <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
      {tableColumns.map((_, colIndex) => (
        <TableCell key={`skeleton-${rowIndex}-${colIndex}`} className="px-6 py-4">
          <div className="h-4 w-full max-w-[200px] rounded-md animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted" />
        </TableCell>
      ))}
    </TableRow>
  ))

  return (
    <div className="space-y-4">
      {/* Header Section */}
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}

      <Card>
        <CardContent>
          {/* Search and Filters - Enhanced responsive layout */}
          <div className="flex flex-col gap-2 md:gap-4 xl:flex-row xl:items-center xl:justify-between mb-2">
            {/* Left side - Search and Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between sm:flex-1">
              {
                /* Search Input */
                isSearchEnabled && (  
                  <div className="relative w-full sm:w-auto sm:min-w-[240px] md:min-w-[280px] lg:min-w-[320px] xl:max-w-md">
                    <Search className="absolute left-2 md:left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={globalFilter}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                      className="pl-7 md:pl-9 h-8 md:h-8 bg-background border-input w-full text-xs md:text-sm"
                    />
                    {globalFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 p-0 text-muted-foreground hover:text-foreground text-sm md:text-lg"
                        onClick={() => handleSearchChange("")}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                )
              }

              {/* Filter Row - Enhanced responsive styling */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <Button
                  value="filter"
                  variant="outline"
                  className="h-8"
                >
                  <SlidersHorizontalIcon className="w-3 h-3" />
                  Filters
                </Button>
                {/* Time Filter */}
                {timeFilter && (
                  <Select value={timeFilter.value} onValueChange={timeFilter.onChange}>
                    <SelectTrigger className="w-full sm:w-[120px] md:w-[140px] h-8 md:h-10 shadow-sm text-xs md:text-sm">
                      <Calendar className="mr-1 md:mr-2 h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFilter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs md:text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {/* Show Filter */}
                {showFilter && (
                  <Select value={showFilter.value} onValueChange={showFilter.onChange}>
                    <SelectTrigger className="w-full sm:w-[130px] md:w-[150px] h-8 md:h-10 shadow-sm text-xs md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {showFilter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs md:text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            {/* Right side - Filters Button */}
            {filters.length > 0 && (
              <Button variant="outline" size="default" className="h-8 md:h-10 px-2 md:px-3 shadow-sm hover:shadow-md transition-shadow text-xs md:text-sm">
                <SlidersHorizontal className="mr-1 md:mr-2 h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            )}
          </div>

          {/* Active Search Badge - Enhanced responsive */}
          {globalFilter && (
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                <Search className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="max-w-[120px] md:max-w-[150px] truncate">"{globalFilter}"</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-0.5 text-primary hover:text-primary/80 hover:bg-transparent"
                  onClick={() => handleSearchChange("")}
                >
                  <X className="h-2 w-2 md:h-2.5 md:w-2.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Table - Enhanced responsive design with better font sizing and scroll indicators */}
          <div className="rounded-md md:rounded-lg border bg-background shadow-none overflow-hidden relative">
            {isLoading || table.getRowModel().rows?.length ? (
              <div className="relative">
                {/* Left scroll indicator */}
                {showScrollIndicator.left && (
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/95 via-background/80 to-transparent z-10 pointer-events-none flex items-center justify-start pl-1">
                    <div className="w-6 h-6 rounded-full bg-background/90 backdrop-blur-sm shadow-md flex items-center justify-center border border-border/50">
                      <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90" />
                    </div>
                  </div>
                )}
                
                {/* Right scroll indicator */}
                {showScrollIndicator.right && (
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/95 via-background/80 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1">
                    <div className="w-6 h-6 rounded-full bg-background/90 backdrop-blur-sm shadow-md flex items-center justify-center border border-border/50">
                      <ChevronDown className="h-4 w-4 text-muted-foreground rotate-90" />
                    </div>
                  </div>
                )}
                
                <div 
                  ref={tableContainerRef}
                  className="overflow-x-auto overflow-y-visible scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'hsl(var(--muted-foreground) / 0.2) transparent'
                  }}
                >
                  <Table className="min-w-full">
                  <TableHeader className="bg-muted/30">
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id} className="border-b hover:bg-transparent">
                        {headerGroup.headers.map(header => (
                          <TableHead 
                            key={header.id}
                            className="h-10 md:h-12 px-2 md:px-4 text-left align-middle font-semibold text-foreground/80 [&:has([role=checkbox])]:pr-0 whitespace-nowrap text-xs"
                          >
                            {header.isPlaceholder ? null : (
                              <div 
                                className={`flex items-center space-x-1 ${
                                  header.column.getCanSort() ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''
                                }`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span className="truncate font-medium text-xs">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {header.column.getCanSort() && (
                                  <div className="flex flex-col flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                                    <ChevronUp 
                                      className={`h-2 w-2 md:h-2.5 md:w-2.5 ${
                                        header.column.getIsSorted() === 'asc' 
                                          ? 'text-foreground opacity-100' 
                                          : 'text-muted-foreground'
                                      }`} 
                                    />
                                    <ChevronDown 
                                      className={`h-2 w-2 md:h-2.5 md:w-2.5 -mt-0.5 ${
                                        header.column.getIsSorted() === 'desc' 
                                          ? 'text-foreground opacity-100' 
                                          : 'text-muted-foreground'
                                      }`} 
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      skeletonRows
                    ) : (
                      table.getRowModel().rows.map(row => {
                        const isSelected = bulkActions ? isRowSelected(row.original) : false;
                        
                        return (
                          <TableRow 
                            key={row.id} 
                            className={`border-b border-border/50 transition-all duration-200 hover:bg-muted/30 data-[state=selected]:bg-muted/50 ${
                              rowClickable || onRowClick ? 'cursor-pointer hover:shadow-sm' : ''
                            } ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary/50' : ''}`}
                            onClick={(event) => {
                              // Prevent row click if clicking on interactive elements
                              const target = event.target as HTMLElement;
                              const isInteractiveElement = target.closest('button, input, [role="checkbox"], a, select, textarea') ||
                                                          target.getAttribute('role') === 'checkbox' ||
                                                          target.closest('[data-prevent-row-click]');
                              
                              if (!isInteractiveElement) {
                                onRowClick?.(row.original, event);
                              }
                            }}
                          >
                            {row.getVisibleCells().map(cell => (
                              <TableCell key={cell.id} className="px-2 md:px-4 py-2 md:py-3 text-xs">
                                <div className={`truncate max-w-[120px] md:max-w-[200px] lg:max-w-none transition-colors ${
                                  isSelected ? 'text-primary' : ''
                                }`}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            ) : (
              <div className="h-60 md:h-80 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 px-3 py-6">
                  {emptyState?.icon ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      <emptyState.icon className="relative h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 text-muted-foreground/40" />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      <div className="relative h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 rounded-full bg-muted/50 flex items-center justify-center">
                        <Search className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-muted-foreground/50" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1 md:space-y-2 max-w-xs md:max-w-sm">
                    <h4 className="text-base md:text-lg lg:text-xl font-semibold text-foreground">
                      {emptyState?.title || (globalFilter ? "No results found" : "No data available")}
                    </h4>
                    {emptyState?.description && (
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {emptyState.description}
                      </p>
                    )}
                    {globalFilter && (
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search criteria or{" "}
                        <button 
                          onClick={() => handleSearchChange("")}
                          className="text-primary hover:underline font-medium"
                        >
                          clear your search
                        </button>
                      </p>
                    )}
                  </div>
                  {emptyState?.action && !globalFilter && (
                    <Button
                      onClick={emptyState.action.onClick}
                      className="mt-2 shadow-md hover:shadow-lg transition-shadow text-xs md:text-sm"
                      size="sm"
                    >
                      {emptyState.action.label}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 md:gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/20 rounded-md md:rounded-lg p-2 md:p-3">
            <div className="text-xs text-muted-foreground order-2 sm:order-1 font-medium">
              {pagination ? (
                `Showing ${((pagination.page - 1) * pagination.limit) + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} results`
              ) : (
                table.getFilteredRowModel().rows.length === 0
                  ? "0 results"
                  : `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected`
              )}
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-1 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (pagination) {
                    onPageChange?.(pagination.page - 1)
                  } else {
                    table.previousPage()
                  }
                }}
                disabled={pagination ? pagination.page <= 1 : !table.getCanPreviousPage()}
                className="h-7 md:h-8 px-2 md:px-3 shadow-sm hover:shadow-md transition-shadow text-xs"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              {pagination ? (
                <div className="flex items-center space-x-0.5">
                  {Array.from({ length: pagination.totalPages }, (_, idx) => {
                    const pageNumber = idx + 1
                    const isCurrentPage = pageNumber === pagination.page
                    
                    const shouldShow = 
                      pageNumber === 1 || 
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                    
                    if (!shouldShow) {
                      if (pageNumber === pagination.page - 2 || pageNumber === pagination.page + 2) {
                        return <span key={idx} className="px-1 text-muted-foreground text-xs font-medium">…</span>
                      }
                      return null
                    }
                    
                    return (
                      <Button
                        key={idx}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(pageNumber)}
                        className={`h-7 w-7 md:h-8 md:w-8 p-0 text-xs shadow-sm transition-all ${
                          isCurrentPage 
                            ? 'shadow-md bg-primary text-primary-foreground' 
                            : 'hover:shadow-md'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center space-x-0.5">
                  {Array.from({ length: Math.min(table.getPageCount(), 5) }).map((_, idx) => {
                    const pageIndex = idx + Math.max(0, table.getState().pagination.pageIndex - 2)
                    if (pageIndex >= table.getPageCount()) return null
                    
                    return (
                      <Button
                        key={pageIndex}
                        variant={table.getState().pagination.pageIndex === pageIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => table.setPageIndex(pageIndex)}
                        className="h-7 w-7 md:h-8 md:w-8 p-0 text-xs shadow-sm hover:shadow-md transition-shadow"
                      >
                        {pageIndex + 1}
                      </Button>
                    )
                  })}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (pagination) {
                    onPageChange?.(pagination.page + 1)
                  } else {
                    table.nextPage()
                  }
                }}
                disabled={pagination ? pagination.page >= pagination.totalPages : !table.getCanNextPage()}
                className="h-7 md:h-8 px-2 md:px-3 shadow-sm hover:shadow-md transition-shadow text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Bottom Bulk Actions Bar */}
      {bulkActions && selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-full shadow-lg px-4 py-2 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              {/* Selection info */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                  <CheckCircle className="h-3 w-3 text-primary" />
                </div>
                <span className="font-medium text-foreground">
                  {selectedRows.length} selected
                </span>
              </div>
              
              <div className="h-4 w-px bg-border" />
              
              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {bulkActions.actions.map((action, index) => {
                  const variantStyles = {
                    default: "text-foreground hover:bg-muted",
                    success: "text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30",
                    warning: "text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/30",
                    destructive: "text-red-700 hover:bg-red-100 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                  }
                  
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBulkAction(action)}
                      disabled={bulkActionLoading}
                      className={`h-7 px-2 text-xs transition-all duration-200 ${
                        variantStyles[action.variant || 'default']
                      }`}
                    >
                      {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                      {action.label}
                    </Button>
                  )
                })}
                
                <div className="h-4 w-px bg-border mx-1" />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRows([])
                    bulkActions.onSelectionChange?.([])
                  }}
                  className="h-7 w-7 p-0 hover:bg-muted hover:text-muted-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {bulkActionLoading && (
                  <div className="flex items-center gap-1 ml-2">
                    <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              {pendingAction?.variant === 'destructive' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
              )}
              {pendingAction?.confirmTitle || 'Confirm Action'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {pendingAction?.confirmMessage || 
                `Are you sure you want to ${pendingAction?.label?.toLowerCase()} ${selectedRows.length} item${selectedRows.length !== 1 ? 's' : ''}? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAction}
              disabled={bulkActionLoading}
              className="transition-all duration-200 hover:scale-[0.98] active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={pendingAction?.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              disabled={bulkActionLoading}
              className="w-full sm:w-auto transition-all duration-200 hover:scale-[0.98] active:scale-95 shadow-lg"
            >
              {bulkActionLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                pendingAction?.confirmButtonText || 'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
