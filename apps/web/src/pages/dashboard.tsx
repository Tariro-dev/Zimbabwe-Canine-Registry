import * as React from 'react';
import { 
  useGetDashboardStats, 
  useListRecentDogs,
  ActivityItem
} from '@workspace/api-client-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Syringe, 
  TrendingUp, 
  Link as LinkIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentDogs, isLoading: dogsLoading } = useListRecentDogs();

  if (statsLoading || dogsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-28"></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Registry Overview</h1>
        <p className="text-muted-foreground mt-1">Live metrics from the Zimbabwe Canine Registry blockchain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Registered"
          value={stats.totalDogs}
          icon={ShieldCheck}
          trend={`+${stats.registeredThisMonth} this month`}
          trendPositive={true}
        />
        <StatCard 
          title="Blockchain Verified"
          value={stats.blockchainConfirmed}
          icon={LinkIcon}
          description="Immutable records"
        />
        <StatCard 
          title="Stolen Reports"
          value={stats.stolenReports}
          icon={AlertTriangle}
          trend="Active alerts"
          trendPositive={false}
        />
        <StatCard 
          title="Litters Tracked"
          value={stats.totalLitters}
          icon={Activity}
          description="Pre-registered"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest dogs added to the ledger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(recentDogs) && recentDogs.map((dog) => (
                <div key={dog.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <Link href={`/dogs/${dog.id}`} className="font-semibold text-primary hover:underline">
                      {dog.name}
                    </Link>
                    <span className="text-sm text-muted-foreground">{dog.breed} • {dog.gender}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      <LinkIcon className="w-3 h-3" />
                      {dog.microchipId}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {dog.registrationDate ? format(new Date(dog.registrationDate), 'MMM d, yyyy') : 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Status</CardTitle>
            <CardDescription>Mainnet Connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Blockchain</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nodes</span>
              <span className="text-sm font-mono">12 Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Block Time</span>
              <span className="text-sm font-mono">1.2s</span>
            </div>
            <div className="pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="w-full">Network Explorer</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Activity</CardTitle>
            <CardDescription>Live blockchain events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {Array.isArray(stats.recentActivity) && stats.recentActivity.map((activity, i) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm capitalize">{activity.type.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {activity.timestamp ? format(new Date(activity.timestamp), 'HH:mm') : '--:--'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {activity.dogName && (
                      <div className="mt-2 text-xs font-medium text-primary">
                        Dog: {activity.dogName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, trend, trendPositive }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className={cn(
            "text-xs mt-1",
            trendPositive === true ? "text-emerald-500" : trendPositive === false ? "text-destructive" : "text-muted-foreground"
          )}>
            {trend || description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'registration': return <ShieldCheck className="w-4 h-4" />;
    case 'transfer': return <TrendingUp className="w-4 h-4" />;
    case 'health_update': return <Syringe className="w-4 h-4" />;
    case 'stolen_flag': return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case 'litter': return <Activity className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
}
