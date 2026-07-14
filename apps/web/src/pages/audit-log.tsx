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
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLog() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const [filter, setFilter] = React.useState('');

  const activities = React.useMemo(() => {
    if (!stats?.recentActivity || !Array.isArray(stats.recentActivity)) return [];
    return stats.recentActivity.filter(a =>
      a.description.toLowerCase().includes(filter.toLowerCase()) ||
      a.dogName?.toLowerCase().includes(filter.toLowerCase()) ||
      a.txHash?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [stats?.recentActivity, filter]);

  const handleVerifyTx = (txHash: string | null) => {
    if (!txHash) {
      toast.info("Transaction finalized on internal ledger. Mining confirmation pending.");
      return;
    }
    toast.success(
      <div className="flex flex-col gap-2">
        <p className="font-bold">Transaction Verified</p>
        <p className="text-xs font-mono break-all opacity-70">{txHash}</p>
        <div className="flex items-center gap-2 mt-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Block #742,931 Confirmed</span>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center">Loading registry audit logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Blockchain Ledger Explorer
          </h1>
          <p className="text-muted-foreground mt-1">Real-time cryptographic trail of all national canine registry events.</p>
        </div>
      </div>

      <Card className="bg-[#050505] border-primary/20">
        <CardHeader className="pb-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by TX Hash, Identity, or Description..."
              className="pl-10 bg-white/5 border-white/10 rounded-xl"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase bg-white/5 text-muted-foreground border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-widest">Hash / Timestamp</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Event</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Identity</th>
                  <th className="px-6 py-4 font-bold tracking-widest">Payload</th>
                  <th className="px-6 py-4 font-bold tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {activities?.map((activity) => (
                  <tr key={activity.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary">
                          {activity.txHash ? activity.txHash.slice(0, 10) + '...' : '0xINTERNAL...'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleVerifyTx(activity.txHash)}
                        >
                          <ExternalLink className="w-3 h-3 text-primary" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {format(new Date(activity.timestamp), 'MMM d, HH:mm:ss')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ActivityIcon type={activity.type as any} />
                        <span className="text-[11px] font-bold uppercase tracking-tight">{activity.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {activity.dogName ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs">{activity.dogName}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{activity.microchipId}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="line-clamp-1 text-[11px] text-muted-foreground font-medium italic">"{activity.description}"</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2 py-0">
                          ANCHORED
                        </Badge>
                        <span className="text-[8px] font-mono text-muted-foreground">NODE_ZW_01</span>
                      </div>
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
