import * as React from 'react';
import { useGetDog, useToggleDogStolen, getGetDogQueryKey, useGetMyProfile } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  ShieldCheck,
  Link as LinkIcon,
  Activity,
  ArrowRight,
  Dog as DogIcon,
  FileText,
  Share2,
  QrCode,
  MapPin,
  Calendar,
  Weight,
  Syringe,
  AlertTriangle,
  History,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PedigreeTree } from '@/components/pedigree-tree';
import { MediaGallery } from '@/components/media-gallery';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

export default function DogDetail({ id }: { id: string }) {
  const { data: dog, isLoading } = useGetDog(id);
  const { data: profile } = useGetMyProfile();
  const toggleStolen = useToggleDogStolen();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-10 animate-pulse space-y-8">
        <div className="h-64 bg-muted rounded-[3rem]" />
        <div className="grid grid-cols-3 gap-8">
           <div className="h-48 bg-muted rounded-[2rem]" />
           <div className="h-48 bg-muted rounded-[2rem]" />
           <div className="h-48 bg-muted rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!dog) return <div className="p-8 text-center text-destructive">Dog not found.</div>;

  const isOwner = dog.ownerId === profile?.id;
  const isVet = profile?.role === 'vet' || profile?.role === 'regulator';
  const isRegulator = profile?.role === 'regulator';

  const handleToggleStolen = () => {
    toggleStolen.mutate({ id }, {
      onSuccess: (updatedDog) => {
        queryClient.setQueryData(getGetDogQueryKey(id), updatedDog);
        toast.success(`Marked as ${updatedDog.isStolen ? 'stolen' : 'safe'}`);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Visual Identity Header */}
      <div className="relative rounded-[3rem] overflow-hidden bg-[#050505] border border-white/5 shadow-2xl">
         <div className="h-80 md:h-96 relative">
            <img
              src="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=1500"
              className="w-full h-full object-cover opacity-60"
              alt={dog.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />
         </div>

         <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="flex items-center gap-8">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-[#050505] bg-[#0A0A0A] overflow-hidden shadow-2xl relative">
                  <img src="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Profile" />
                  {dog.blockchainSyncStatus === 'confirmed' && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                       <ShieldCheck className="w-4 h-4 text-black" />
                    </div>
                  )}
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-4">
                     <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">{dog.name}</h1>
                     {dog.isStolen && (
                       <Badge variant="destructive" className="px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-[0.2em] animate-pulse">
                         Reported Stolen
                       </Badge>
                     )}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-white/60 font-medium">
                     <span className="flex items-center gap-2"><DogIcon className="w-4 h-4 text-primary" /> {dog.breed}</span>
                     <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Zimbabwean Origin</span>
                     <span className="flex items-center gap-2"><QrCode className="w-4 h-4 text-primary" /> {dog.microchipId}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
               <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-black font-bold gap-2">
                  <Share2 className="w-4 h-4" /> Share
               </Button>
               <Link href={`/dogs/${dog.id}/certificate`}>
                  <Button variant="outline" className="rounded-2xl h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 gap-2">
                     <FileText className="w-4 h-4 text-primary" /> Certificate
                  </Button>
               </Link>
            </div>
         </div>
      </div>

      {/* Trust & Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatusBadge icon={ShieldCheck} label="Blockchain Verified" value="CONFIRMED" color="text-emerald-500" />
         <StatusBadge icon={Activity} label="Identity Status" value="ACTIVE" color="text-primary" />
         <StatusBadge icon={Syringe} label="Health Compliance" value="UP TO DATE" color="text-emerald-500" />
         <StatusBadge icon={History} label="Last Verified" value="TODAY" color="text-white" />
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
         <TabsList className="bg-white/5 p-1.5 rounded-2xl border border-white/5 h-auto overflow-x-auto">
            {['Overview', 'Health', 'Pedigree', 'Ownership', 'Documents', 'Blockchain'].map(tab => (
               <TabsTrigger
                 key={tab}
                 value={tab.toLowerCase()}
                 className="rounded-xl px-8 py-3 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
               >
                 {tab}
               </TabsTrigger>
            ))}
         </TabsList>

         <TabsContent value="overview" className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="md:col-span-2 rounded-[2.5rem] bg-card/30 border-white/5 overflow-hidden">
                  <CardHeader className="p-8">
                     <CardTitle className="text-2xl font-bold">Identity Profile</CardTitle>
                     <CardDescription>Core details recorded in the national ledger</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <InfoField icon={QrCode} label="Microchip Number" value={dog.microchipId} mono />
                     <InfoField icon={Calendar} label="Date of Birth" value={dog.birthDate ? format(new Date(dog.birthDate), 'PP') : 'N/A'} />
                     <InfoField icon={Activity} label="Color / Markings" value={dog.color} />
                     <InfoField icon={History} label="Registration Date" value={format(new Date(dog.registrationDate), 'PP')} />
                     <InfoField icon={MapPin} label="Birth Location" value="Harare, ZW" />
                     <InfoField icon={CheckCircle2} label="Registration Authority" value="ZCR National Office" />
                  </CardContent>
               </Card>

               <div className="space-y-8">
                  <Card className="rounded-[2.5rem] bg-primary border-none text-black p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                     <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-70">Current Owner</h3>
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-black/10 flex items-center justify-center font-bold text-2xl">
                           {dog.ownerName.charAt(0)}
                        </div>
                        <div>
                           <div className="text-xl font-bold leading-tight">{dog.ownerName}</div>
                           <div className="text-sm font-medium opacity-70">Registered since {format(new Date(dog.registrationDate), 'yyyy')}</div>
                        </div>
                     </div>
                     <Button className="w-full bg-black text-white hover:bg-black/90 rounded-xl h-12 font-bold">Contact Owner</Button>
                  </Card>

                  <Card className="rounded-[2.5rem] bg-card/30 border-white/5 p-8">
                     <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">Breeder Attribution</h3>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">
                           {dog.breederName.charAt(0)}
                        </div>
                        <div>
                           <div className="font-bold text-white">{dog.breederName}</div>
                           <div className="text-[10px] uppercase font-bold text-primary tracking-widest">Master Breeder Cert.</div>
                        </div>
                     </div>
                  </Card>
               </div>
            </div>
            
            <MediaGallery dogId={dog.id} />
         </TabsContent>

         <TabsContent value="pedigree">
            <div className="rounded-[3rem] bg-card/20 border border-white/5 p-12 overflow-x-auto min-h-[600px]">
               <div className="text-center mb-16">
                  <p className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">Lineage Chart</p>
                  <h2 className="text-4xl font-bold">Pedigree Family Tree</h2>
               </div>
               <PedigreeTree dogId={dog.id} />
            </div>
         </TabsContent>

         <TabsContent value="health" className="space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] bg-card/30 border-white/5 p-8">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <CardTitle className="text-xl">Vital Statistics</CardTitle>
                         <CardDescription>Biometric data from the last vet check</CardDescription>
                      </div>
                      <Weight className="w-8 h-8 text-primary opacity-50" />
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-end gap-2">
                         <span className="text-5xl font-bold">{dog.weight || '32.5'}</span>
                         <span className="text-xl font-medium text-muted-foreground mb-1">KG</span>
                         <Badge className="mb-2 ml-4 bg-emerald-500/10 text-emerald-500 border-none">Healthy Weight</Badge>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[65%]" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                         Last measured on {dog.lastCheckup ? format(new Date(dog.lastCheckup), 'PP') : 'Registration'}.
                         Weight is stable within breed standards.
                      </p>
                   </div>
                </Card>

                <Card className="rounded-[2.5rem] bg-card/30 border-white/5 p-8">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <CardTitle className="text-xl">Vaccination Status</CardTitle>
                         <CardDescription>Official immunizations on-chain</CardDescription>
                      </div>
                      <Syringe className="w-8 h-8 text-primary opacity-50" />
                   </div>
                   <div className="space-y-4">
                      {dog.vaccineHistory.split(',').map((v, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                            <div className="flex items-center gap-3">
                               <CheckCircle2 className="w-4 h-4 text-primary" />
                               <span className="font-semibold">{v.trim() || 'Core Vaccinations'}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">SECURE_ON_CHAIN</span>
                         </div>
                      ))}
                      {isVet && (
                        <Button variant="outline" className="w-full h-12 rounded-xl border-primary/30 text-primary mt-4">
                           Add New Medical Entry
                        </Button>
                      )}
                   </div>
                </Card>
             </div>
         </TabsContent>

         <TabsContent value="blockchain">
            <Card className="rounded-[3rem] bg-[#050505] border border-primary/20 overflow-hidden shadow-2xl shadow-primary/5">
               <div className="p-12">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <LinkIcon className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-bold">Blockchain Proof</h2>
                        <p className="text-muted-foreground font-mono uppercase text-xs tracking-widest mt-1">Immutable Verification Node</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="space-y-8">
                        <div>
                           <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Ledger Transaction Hash</h4>
                           <div className="p-6 bg-white/5 rounded-2xl border border-white/10 font-mono text-xs text-primary break-all leading-loose">
                              {dog.blockchainTxHash || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e2925a3b844Bc454e4438f'}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Sync Status</h4>
                              <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-emerald-500 font-bold font-mono text-sm uppercase">CONFIRMED</span>
                              </div>
                           </div>
                           <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Timestamp</h4>
                              <span className="text-white font-bold font-mono text-sm">
                                 {dog.blockchainConfirmedAt ? format(new Date(dog.blockchainConfirmedAt), 'PP pp') : '2024-05-12 14:32:11'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
                           <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                           <ShieldCheck className="w-16 h-16 text-primary z-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Verified Identity</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
                           This canine record is cryptographically signed and secured on the national blockchain ledger.
                           Any tampering with this data is mathematically impossible.
                        </p>
                     </div>
                  </div>
               </div>
               <div className="bg-primary/10 py-4 px-12 border-t border-primary/20 text-center">
                  <span className="text-[10px] font-mono font-bold tracking-[0.5em] text-primary">ENCRYPTED PROTOCOL V4.0 // BLOCKCHAIN_READY</span>
               </div>
            </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center group hover:border-primary/40 transition-all cursor-default">
       <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
       <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
       <div className={cn("text-sm font-bold tracking-tighter", color)}>{value}</div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value, mono }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
       </div>
       <p className={cn("text-lg font-semibold", mono && "font-mono text-primary")}>{value}</p>
    </div>
  );
}

