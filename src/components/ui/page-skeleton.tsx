'use client';

import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  className?: string;
  variant?: 'dashboard' | 'table' | 'form' | 'profile';
}

export function PageSkeleton({ className, variant = 'dashboard' }: PageSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'profile' && <ProfileSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div className="h-9 w-24 bg-muted rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded-md" />
                <div className="h-7 w-16 bg-muted rounded-md" />
                <div className="h-3 w-20 bg-muted/60 rounded-md" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-32 bg-muted rounded-md" />
          <div className="border rounded-lg p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted rounded-md" />
                  <div className="h-3 w-3/4 bg-muted/60 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-6 w-28 bg-muted rounded-md" />
          <div className="border rounded-lg p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-3 w-2/3 bg-muted/60 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="space-y-1">
            <div className="h-7 w-40 bg-muted rounded-md" />
            <div className="h-4 w-56 bg-muted/60 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted rounded-md" />
          <div className="h-8 w-18 bg-muted rounded-md" />
          <div className="h-8 w-20 bg-muted rounded-md" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-80 bg-muted rounded-md" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded-md" />
          <div className="h-10 w-20 bg-muted rounded-md" />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-muted/30 border-b">
          <div className="flex">
            <div className="w-12 p-4">
              <div className="h-4 w-4 bg-muted rounded" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 p-4">
                <div className="h-4 w-full bg-muted rounded-md" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-border/50">
            <div className="flex">
              <div className="w-12 p-4">
                <div className="h-4 w-4 bg-muted rounded" />
              </div>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex-1 p-4">
                  <div className="space-y-1">
                    <div className="h-4 w-full bg-muted rounded-md" />
                    {j === 0 && <div className="h-3 w-2/3 bg-muted/60 rounded-md" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-muted/20 rounded-lg p-3">
        <div className="h-4 w-48 bg-muted rounded-md" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-7 bg-muted rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-md" />
        <div className="h-4 w-72 bg-muted/60 rounded-md" />
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded-md" />
              <div className="h-10 w-full bg-muted rounded-md" />
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded-md" />
              <div className="h-10 w-full bg-muted rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Large Text Area */}
      <div className="space-y-2">
        <div className="h-4 w-20 bg-muted rounded-md" />
        <div className="h-32 w-full bg-muted rounded-md" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <div className="h-10 w-20 bg-muted rounded-md" />
        <div className="h-10 w-24 bg-muted rounded-md" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-7 w-40 bg-muted rounded-md" />
          <div className="h-4 w-56 bg-muted/60 rounded-md" />
          <div className="h-4 w-32 bg-muted/60 rounded-md" />
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="h-5 w-32 bg-muted rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-3 w-20 bg-muted/60 rounded-md" />
                    <div className="h-4 w-full bg-muted rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="h-5 w-24 bg-muted rounded-md" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted/60 rounded-md" />
                <div className="h-4 w-16 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable skeleton components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border rounded-lg bg-card animate-pulse", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded-md" />
          <div className="h-7 w-16 bg-muted rounded-md" />
          <div className="h-3 w-20 bg-muted/60 rounded-md" />
        </div>
        <div className="h-8 w-8 bg-muted rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-muted/30 border-b p-4">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 bg-muted rounded-md" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border/50 p-4">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex-1">
                <div className="h-4 w-full bg-muted rounded-md" />
                {j === 0 && <div className="h-3 w-2/3 bg-muted/60 rounded-md mt-1" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
