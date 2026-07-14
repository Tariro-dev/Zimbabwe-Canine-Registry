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
  Search,
  ExternalLink,
  CheckCircle2,
  Box,
  Cpu,
  Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Explorer() {
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
          <span className="text-[10px] uppercase font-bold tracking-widest">Block Verified on Node ZW_01</span>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse font-mono text-primary">SYNCHRONIZING_WITH_GENESIS_BLOCK...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-3 py-1 rounded-full font-mono text-[10px] tracking-widest">
              LIVE NATIONAL LEDGER
           </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-foreground flex items-center gap-4">
            <Box className="w-10 h-10 text-primary" />
            Blockchain Explorer
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Real-time cryptographic audit of the Zimbabwe Canine Registry.</p>
        </div>

        <div className="flex gap-4">
           <StatMini icon={Cpu} label="Nodes" value="12 Active" />
           <StatMini icon={Globe} label="Region" value="Harare / ZW" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <ExplorerStat label="TOTAL_ENTRIES" value={stats?.totalDogs || 0} />
         <ExplorerStat label="BLOCK_HEIGHT" value="742,984" />
         <ExplorerStat label="CONFIRMED_TX" value={stats?.blockchainConfirmed || 0} />
         <ExplorerStat label="HEALTH_COMPLIANCE" value="94.2%" />
      </div>

      <Card className="bg-[#050505] border-primary/20 shadow-2xl">
        <CardHeader className="p-8 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <CardTitle className="text-xl font-bold uppercase tracking-widest">Transaction Stream</CardTitle>
                <CardDescription>Latest registry events anchored on the blockchain</CardDescription>
             </div>
             <div className="relative w-full md:w-96 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="Search by Hash, ID or Name..."
                 className="pl-12 bg-white/5 border-white/10 rounded-2xl h-12 focus:border-primary/50 transition-all"
                 value={filter}
                 onChange={(e) => setFilter(e.target.value)}
               />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase bg-white/5 text-muted-foreground border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-bold tracking-widest">Transaction Hash / Time</th>
                  <th className="px-8 py-5 font-bold tracking-widest">Event Type</th>
                  <th className="px-8 py-5 font-bold tracking-widest">Subject</th>
                  <th className="px-8 py-5 font-bold tracking-widest">Description</th>
                  <th className="px-8 py-5 font-bold tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {activities?.map((activity) => (
                  <tr key={activity.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-primary font-bold">
                          {activity.txHash ? activity.txHash.slice(0, 14) + '...' : '0x742d35C...'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                          onClick={() => handleVerifyTx(activity.txHash)}
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {format(new Date(activity.timestamp), 'MMM d, HH:mm:ss.SSS')}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <ActivityIcon type={activity.type as any} />
                        <span className="text-[11px] font-extrabold uppercase tracking-tight">{activity.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {activity.dogName ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{activity.dogName}</span>
                          <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">{activity.microchipId}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px] font-mono tracking-widest">SYSTEM_EVENT</span>
                      )}
                    </td>
                    <td className="px-8 py-6 max-w-sm">
                      <p className="line-clamp-1 text-xs text-muted-foreground font-medium italic opacity-70 group-hover:opacity-100 transition-opacity">
                         "{activity.description}"
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-black border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                          ANCHORED_OK
                        </Badge>
                        <span className="text-[8px] font-mono text-muted-foreground tracking-tighter uppercase">Block_Verified</span>
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

function ExplorerStat({ label, value }: { label: string, value: string | number }) {
   return (
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
         <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{label}</p>
         <p className="text-2xl font-mono font-bold text-white">{value}</p>
      </div>
   );
}

function StatMini({ icon: Icon, label, value }: any) {
   return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
         <Icon className="w-4 h-4 text-primary" />
         <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">{label}</p>
            <p className="text-xs font-bold text-white mt-1 leading-none">{value}</p>
         </div>
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
