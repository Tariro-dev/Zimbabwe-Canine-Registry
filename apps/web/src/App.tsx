import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppLayout } from '@/components/layout/app-layout';

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
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dogs" component={DogsList} />
        <Route path="/dogs/:id">
          {(params) => <DogDetail id={params.id} />}
        </Route>
        <Route path="/dogs/:id/certificate">
          {(params) => <DogCertificate id={params.id} />}
        </Route>
        <Route path="/dogs/:id/health">
          {(params) => <UpdateHealth id={params.id} />}
        </Route>
        <Route path="/dogs/:id/transfer">
          {(params) => <TransferOwnership id={params.id} />}
        </Route>
        <Route path="/register" component={RegisterDog} />
        <Route path="/verify" component={Verify} />
        <Route path="/litters" component={LittersList} />
        <Route path="/regulator" component={RegulatorDashboard} />
        <Route path="/audit-log" component={AuditLog} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
