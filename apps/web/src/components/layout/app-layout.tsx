import * as React from 'react';
import { Sidebar } from './sidebar';
import { Menu, Search, Bell, Mail, Sun, Moon, User, AlertTriangle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { NotificationCenter } from '../notification-center';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useGetMyProfile } from '@workspace/api-client-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const token = localStorage.getItem('zcr_auth_token');

  const isPublicPath = location === '/verify' || location.startsWith('/explorer') || location === '/';

  const { data: profile, isLoading, error } = useGetMyProfile({
    query: {
      enabled: !!token && !isPublicPath,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: 2000,
    }
  });

  React.useEffect(() => {
    if (!token && !isLoading && !isPublicPath) {
      setLocation('/login');
    }
  }, [isLoading, setLocation, token, isPublicPath]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-[2rem] flex items-center justify-center mb-6 border border-destructive/20 shadow-2xl">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Registry Connection Offline</h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          The national blockchain node is currently synchronizing or offline. Please ensure the backend server is running and try again.
        </p>
        <Button
          variant="outline"
          className="border-primary/30 text-primary"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <img src="/favicon.svg" className="w-16 h-16 animate-pulse brightness-125" alt="Loading..." />
           <p className="text-primary font-mono text-xs tracking-widest animate-pulse">SYNCHRONIZING_LEDGER...</p>
        </div>
      </div>
    );
  }

  const pageTitle = React.useMemo(() => {
    const path = location.split('/')[1] || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Mobile topbar */}
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tighter uppercase" onClick={() => setLocation('/dashboard')}>
          <img src="/favicon.svg" alt="ZCR" className="w-10 h-10" />
          <span>ZCR Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <main className="md:pl-64 min-h-screen flex flex-col transition-all duration-500">
        {/* Desktop Top Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-10 border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold tracking-tight">{pageTitle}</h2>
            <div className="relative w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Global Registry Search..."
                className="pl-10 bg-muted/30 border-none h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </Button>
              <NotificationCenter />
            </div>

            <div className="h-8 w-[1px] bg-border mx-2" />

            <div
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => setLocation('/profile')}
            >
              <div className="text-right hidden xl:block">
                <div className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                  {profile?.name || 'Loading...'}
                </div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  {profile?.role || 'User'}
                </div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shadow-lg shadow-primary/5 group-hover:scale-105 transition-transform">
                  {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-[1600px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

