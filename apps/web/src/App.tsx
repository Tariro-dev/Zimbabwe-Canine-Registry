import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import * as React from 'react';

import NotFound from '@/pages/not-found';
import { AppLayout } from '@/components/layout/app-layout';
import Landing from '@/pages/landing';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import { SplashScreen } from '@/components/splash-screen';
import { ThemeProvider } from '@/components/theme-provider';

import Dashboard from '@/pages/dashboard';
import DogsList from '@/pages/dogs/list';
import DogDetail from '@/pages/dogs/detail';
import RegisterDog from '@/pages/dogs/register';
import UpdateHealth from '@/pages/dogs/health';
import TransferOwnership from '@/pages/dogs/transfer';
import Verify from '@/pages/verify';
import LittersList from '@/pages/litters/list';
import Profile from '@/pages/profile';
import DogCertificate from '@/pages/dogs/certificate';
import RegulatorDashboard from '@/pages/regulator-dashboard';
import AuditLog from '@/pages/audit-log';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Dashboard Routes wrapped in AppLayout */}
      <Route path="/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/dogs">
        <AppLayout><DogsList /></AppLayout>
      </Route>
      <Route path="/dogs/:id">
        {(params) => <AppLayout><DogDetail id={params.id} /></AppLayout>}
      </Route>
      <Route path="/dogs/:id/certificate">
        {(params) => <AppLayout><DogCertificate id={params.id} /></AppLayout>}
      </Route>
      <Route path="/dogs/:id/health">
        {(params) => <AppLayout><UpdateHealth id={params.id} /></AppLayout>}
      </Route>
      <Route path="/dogs/:id/transfer">
        {(params) => <AppLayout><TransferOwnership id={params.id} /></AppLayout>}
      </Route>
      <Route path="/verify">
        <AppLayout><Verify /></AppLayout>
      </Route>
      <Route path="/litters">
        <AppLayout><LittersList /></AppLayout>
      </Route>
      <Route path="/regulator">
        <AppLayout><RegulatorDashboard /></AppLayout>
      </Route>
      <Route path="/audit-log">
        <AppLayout><AuditLog /></AppLayout>
      </Route>
      <Route path="/profile">
        <AppLayout><Profile /></AppLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <TooltipProvider>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
          )}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
