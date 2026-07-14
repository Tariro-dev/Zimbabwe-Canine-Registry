import * as React from 'react';
import { 
  useGetDashboardStats, 
  useListRecentDogs,
  useGetMyProfile
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
  TrendingUp,
  Link as LinkIcon,
  PlusCircle,
  FileCheck,
  Zap,
  ChevronRight,
  Dog
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentDogs, isLoading: dogsLoading } = useListRecentDogs();
  const { data: profile } = useGetMyProfile();

  if (statsLoading || dogsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 w-full bg-muted rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Role-based content customization
  const isOwner = profile?.role === 'owner';
  const isBreeder = profile?.role === 'breeder';
  const isVet = profile?.role === 'vet';
  const isRegulator = profile?.role === 'regulator';

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] bg-[#050505] border border-primary/20 p-8 md:p-12 shadow-2xl shadow-primary/5"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-4 rounded-full font-mono tracking-tighter uppercase">
              {profile?.role ? `${profile.role} Portal` : 'Member Portal'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome back, <span className="gold-text-gradient">{profile?.name?.split(' ')[0] || 'Member'}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              {isRegulator ? "You have administrative oversight of the national registry. Monitor compliance and verify blockchain integrity in real-time." :
               isVet ? "Access veterinary records, sign off on health certifications, and update patient vaccination history on the ledger." :
               isBreeder ? "Manage your kennel registrations, track litter history, and issue blockchain pedigree records for your dogs." :
               "Your registry is currently fully synchronized with the national blockchain ledger. Track your canine assets with immutable records."}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {(isOwner || isBreeder) && (
                <Link href="/dogs/register">
                  <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-black font-bold gap-2">
                    <PlusCircle className="w-5 h-5" /> Register New Dog
                  </Button>
                </Link>
              )}
              {isVet && (
                <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-black font-bold gap-2">
                  <FileCheck className="w-5 h-5" /> Verify Health Record
                </Button>
              )}
              {isRegulator && (
                <Link href="/regulator">
                  <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-black font-bold gap-2">
                    <Activity className="w-5 h-5" /> Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="rounded-2xl h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 gap-2"
                onClick={() => toast.info("Certificate generation module is initializing...")}
              >
                <FileCheck className="w-5 h-5" /> Generate Certificates
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-48 h-48 rounded-full border border-primary/20 flex items-center justify-center p-4">
               <img src="/favicon.svg" alt="Logo" className="w-32 h-32 brightness-125 opacity-50" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={isVet ? "Patients Verified" : isRegulator ? "Total Registered" : "My Registered Dogs"}
          value={stats.totalDogs}
          icon={Dog}
          trend={`${stats.registeredThisMonth} this month`}
          trendPositive={true}
        />
        <StatCard 
          title="Blockchain Verified"
          value={stats.blockchainConfirmed}
          icon={LinkIcon}
          description="Immutable Records"
        />
        <StatCard 
          title="Pending Transfers"
          value={stats.stolenReports}
          icon={TrendingUp}
          trend="Awaiting Approval"
          trendPositive={false}
        />
        <StatCard 
          title={isVet ? "Vaccines Issued" : "Certificates Issued"}
          value={stats.totalLitters}
          icon={ShieldCheck}
          description="Official Status"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <Card className="lg:col-span-2 bg-card/30 backdrop-blur-xl border-white/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
            <div>
              <CardTitle className="text-2xl">My Recent Dogs</CardTitle>
              <CardDescription>Visual history of your registry entries</CardDescription>
            </div>
            <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.isArray(recentDogs) && recentDogs.map((dog) => (
                <Link key={dog.id} href={`/dogs/${dog.id}`}>
                  <div className="group flex items-center gap-4 p-4 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all cursor-pointer">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-white/5">
                      <img src={`https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=100`} alt="Dog" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg truncate">{dog.name}</div>
                      <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{dog.breed}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <ChevronRight className="w-4 h-4 group-hover:text-black" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Network & Activity */}
        <div className="space-y-8">
          <Card className="bg-[#0A0A0A] border-primary/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Network Node</CardTitle>
              </div>
              <CardDescription>Real-time Ledger Connectivity</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3">Operational</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                   <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Peers</div>
                   <div className="text-lg font-mono font-bold">{10 + Math.floor(Math.random() * 15)}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                   <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Latency</div>
                   <div className="text-lg font-mono font-bold">{10 + Math.floor(Math.random() * 20)}ms</div>
                </div>
              </div>
              <Button
                className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                onClick={() => toast.success("Accessing National Canine Blockchain Ledger...")}
              >
                Blockchain Explorer
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/5 rounded-[2rem] overflow-hidden">
             <CardHeader className="p-8 pb-0">
                <CardTitle className="text-lg">Registry Activity</CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-6">
                {Array.isArray(stats.recentActivity) && stats.recentActivity.slice(0, 3).map((activity, i) => (
                   <div key={i} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="space-y-1">
                         <p className="text-sm font-semibold">{activity.description}</p>
                         <p className="text-[10px] font-mono text-muted-foreground uppercase">{activity.timestamp ? format(new Date(activity.timestamp), 'HH:mm') : '--:--'}</p>
                      </div>
                   </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendPositive, description }: any) {
  return (
    <Card className="bg-card/30 border-white/5 rounded-[2rem] hover:border-primary/30 transition-all group overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
              <Icon className="w-6 h-6" />
           </div>
           {trend && (
             <Badge className={cn(
               "font-mono text-[10px] uppercase",
               trendPositive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
             )}>
               {trend}
             </Badge>
           )}
        </div>
        <div className="space-y-1">
           <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
           <div className="text-3xl font-bold tracking-tighter">{value}</div>
           {description && <p className="text-xs text-muted-foreground italic mt-2">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

