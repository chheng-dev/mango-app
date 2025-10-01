'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FormLayout({
  title,
  subtitle,
  breadcrumbs,
  onBack,
  children,
  className
}: FormLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-muted/20", className)}>      
      <div className="w-full mx-auto">
        {children}
      </div>
    </div>
  );
}

// Reusable Form Section Component
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}

// Reusable Form Field Component
interface FormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  description, 
  required, 
  error, 
  children, 
  className 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground leading-none">
          {label}
        </label>
        {required && (
          <span className="text-xs text-destructive font-medium">*</span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      
      <div className="space-y-1">
        {children}
        {error && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Form Grid Component for Layout
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  return (
    <div className={cn(
      "grid gap-6",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 lg:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      className
    )}>
      {children}
    </div>
  );
}

// Form Actions Component (like TailAdmin buttons)
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 pt-6 mt-6 border-t border-border",
      align === 'left' && "justify-start",
      align === 'right' && "justify-end", 
      align === 'center' && "justify-center",
      className
    )}>
      {children}
    </div>
  );
}

// Two Column Layout (like TailAdmin Default Inputs | Input Group)
interface FormColumnsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormColumns({ children, className }: FormColumnsProps) {
  return (
    <div className={cn("grid grid-cols-1 xl:grid-cols-2 gap-6", className)}>
      {children}
    </div>
  );
}

// Input Group Component (like the right side of TailAdmin)
interface InputGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function InputGroup({ title, description, children, className }: InputGroupProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}