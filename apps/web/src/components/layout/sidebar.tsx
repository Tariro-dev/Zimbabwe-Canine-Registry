import * as React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Dog, Search, ListPlus, UserCircle, PlusCircle, ShieldCheck, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dogs', label: 'Registered Dogs', icon: Dog },
    { href: '/register', label: 'Register Dog', icon: PlusCircle },
    { href: '/verify', label: 'Verify Identity', icon: Search },
    { href: '/litters', label: 'Litter Management', icon: ListPlus },
    { href: '/regulator', label: 'National Analytics', icon: ShieldCheck },
    { href: '/audit-log', label: 'System Audit Log', icon: History },
    { href: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg text-sidebar-foreground tracking-tight">ZCR Portal</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50 font-medium">
          Blockchain Status: <span className="text-emerald-500 font-bold">● Synced</span>
        </div>
      </div>
    </aside>
  );
}
