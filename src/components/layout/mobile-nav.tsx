'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Sidebar } from './sidebar';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0 w-80 bg-white dark:bg-slate-900"
      >
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
