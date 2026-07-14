import * as React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Dog,
  Search,
  ListPlus,
  UserCircle,
  PlusCircle,
  ShieldCheck,
  History,
  LogOut,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dogs', label: 'My Dogs', icon: Dog },
    { href: '/dogs/register', label: 'Register Dog', icon: PlusCircle },
    { href: '/verify', label: 'Verify Identity', icon: Search },
    { href: '/litters', label: 'Litter Records', icon: ListPlus },
    { href: '/regulator', label: 'Regulator', icon: ShieldCheck },
    { href: '/audit-log', label: 'Audit Logs', icon: History },
    { href: '/profile', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col z-30 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden animate-in fade-in slide-in-from-left-4 cursor-pointer" onClick={() => setLocation('/dashboard')}>
            <img src="/favicon.svg" alt="ZCR" className="w-10 h-10 brightness-125" />
            <span className="font-bold text-lg text-sidebar-foreground tracking-tighter uppercase truncate">
              ZCR <span className="text-primary">Portal</span>
            </span>
          </div>
        )}
        {isCollapsed && (
          <img src="/favicon.svg" alt="ZCR" className="w-8 h-8 mx-auto brightness-125" />
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 relative group",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(201,168,76,0.1)]"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full gold-glow" />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-primary" : "text-sidebar-foreground/40"
              )} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && isActive && (
                 <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 text-sidebar-foreground/40 hover:text-primary transition-colors"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Collapse Menu</span>}
        </button>

        {!isCollapsed && (
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="text-[10px] text-sidebar-foreground/40 font-bold uppercase tracking-widest mb-2">Blockchain Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-500 font-bold">NODE_SYNCED_OK</span>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
          onClick={() => {
            localStorage.removeItem('zcr_auth_token');
            localStorage.removeItem('zcr_user_id');
            window.location.href = '/';
          }}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-bold">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}

