import * as React from 'react';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  ShieldCheck,
  TrendingUp,
  Syringe,
  AlertTriangle,
  Activity,
  History,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AuditLog() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const [filter, setFilter] = React.useState('');

  const activities = React.useMemo(() => {
    if (!stats?.recentActivity || !Array.isArray(stats.recentActivity)) return [];
    return stats.recentActivity.filter(a =>
      a.description.toLowerCase().includes(filter.toLowerCase()) ||
      a.dogName?.toLowerCase().includes(filter.toLowerCase()) ||
      a.microchipId?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [stats?.recentActivity, filter]);

  if (isLoading) return <div className="p-8 text-center">Loading registry audit logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Registry Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">Immutable trail of all blockchain-anchored activities and identity updates.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Dog Name, Microchip, or Activity Type..."
              className="pl-10"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Event Type</th>
                  <th className="px-6 py-4 font-semibold">Identity</th>
                  <th className="px-6 py-4 font-semibold">Activity Description</th>
                  <th className="px-6 py-4 font-semibold text-right">Ledger Status</th>
                </tr>
              </thead>
              <tbody>
                {activities?.map((activity) => (
                  <tr key={activity.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      {format(new Date(activity.timestamp), 'MMM d, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ActivityIcon type={activity.type as any} />
                        <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {activity.dogName ? (
                        <div className="flex flex-col">
                          <span className="font-semibold">{activity.dogName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{activity.microchipId}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="line-clamp-1 text-muted-foreground">{activity.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-600 bg-emerald-50/50">
                        Anchored
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon({ type }: { type: 'registration' | 'transfer' | 'health_update' | 'stolen_flag' | 'litter' }) {
  switch (type) {
    case 'registration': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    case 'transfer': return <TrendingUp className="w-4 h-4 text-blue-500" />;
    case 'health_update': return <Syringe className="w-4 h-4 text-purple-500" />;
    case 'stolen_flag': return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case 'litter': return <Activity className="w-4 h-4 text-amber-500" />;
    default: return <Activity className="w-4 h-4" />;
  }
}
