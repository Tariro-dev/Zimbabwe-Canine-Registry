import * as React from 'react';
import { Sidebar } from './sidebar';
import { Menu, Search } from 'lucide-react';
import { Link } from 'wouter';
import { NotificationCenter } from '../notification-center';
import { Input } from '@/components/ui/input';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Mobile topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border sticky top-0 z-20">
        <div className="font-bold text-lg text-sidebar-foreground">ZCR Portal</div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button className="p-2 text-sidebar-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <main className="md:pl-64 min-h-screen flex flex-col">
        {/* Desktop Top Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Quick search microchip..." className="pl-10 bg-muted/50 border-none h-9" />
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-px bg-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">Thamsanqa Zwana</div>
                <div className="text-[10px] text-muted-foreground uppercase">Verified Breeder</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                TZ
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
