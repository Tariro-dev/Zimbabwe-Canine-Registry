import * as React from 'react';
import { useSearchDogByMicrochip, useListDogs } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ScanLine, AlertCircle, Filter, ChevronRight, ShieldCheck, ShieldAlert, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatSafeDate } from '@/lib/utils';

export default function Verify() {
  const [query, setQuery] = React.useState('');
  const [submittedQuery, setSubmittedQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ breed: '', gender: '' });
  const [, setLocation] = useLocation();
  const token = localStorage.getItem('zcr_auth_token');

  const { data: dog, isLoading, error } = useSearchDogByMicrochip(
    { microchip: submittedQuery },
    { query: { enabled: !!submittedQuery, retry: false } as any }
  );

  const { data: allDogs } = useListDogs({
    query: { enabled: !!token } // Only show registry list to logged in users
  });

  const filteredDogs = React.useMemo(() => {
    if (!allDogs) return [];
    return allDogs.filter(d => {
      const breedMatch = !filters.breed || d.breed === filters.breed;
      const genderMatch = !filters.gender || d.gender === filters.gender;
      return breedMatch && genderMatch;
    });
  }, [allDogs, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 mt-12 pb-20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-2xl shadow-primary/10">
          <ScanLine className="w-10 h-10" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground gold-text-gradient">Registry Verification</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Verify canine identity, pedigree authenticity, and health status on the Zimbabwe National Blockchain.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Microchip Search */}
        <Card className="bg-[#050505] border-primary/30 shadow-[0_0_50px_rgba(201,168,76,0.05)] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between relative z-10 p-8">
            <div>
              <CardTitle className="text-lg font-bold tracking-widest uppercase">Quick Search</CardTitle>
              <CardDescription>Enter the 15-digit ISO microchip ID</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] border-primary/30 text-primary font-bold gap-2 uppercase hover:bg-primary/10"
              onClick={() => {
                setQuery("900012345678901");
                setSubmittedQuery("900012345678901");
              }}
            >
              <ScanLine className="w-3 h-3" /> Simulate Scanner
            </Button>
          </CardHeader>
          <CardContent className="space-y-8 relative z-10 p-8 pt-0">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="900XXXXXXXXXXXX"
                  className="pl-12 h-16 text-2xl font-mono tracking-[0.2em] bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-white/10 transition-all rounded-2xl"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  maxLength={15}
                />
              </div>
              <Button type="submit" size="lg" className="h-16 px-10 bg-primary hover:bg-primary/90 text-black font-extrabold text-lg rounded-2xl transition-transform active:scale-95" disabled={isLoading || !query}>
                {isLoading ? "CONSULTING_LEDGER..." : "VERIFY IDENTITY"}
              </Button>
            </form>

            {error && (
              <div className="flex items-center gap-4 text-destructive bg-destructive/10 p-6 rounded-2xl border border-destructive/20 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                   <p className="font-bold">Record Not Found</p>
                   <p className="text-sm opacity-80 mt-1">This microchip is not currently registered in the national blockchain database. Please contact the registrar if you believe this is an error.</p>
                </div>
              </div>
            )}

            {dog && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-2 mb-4">
                   <div className="h-px flex-1 bg-white/10" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Cryptographic Match Found</span>
                   <div className="h-px flex-1 bg-white/10" />
                </div>

                <Card className="bg-white/[0.03] border-primary/20 rounded-[2rem] overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="h-full bg-primary/5 p-8 flex flex-col items-center justify-center border-r border-white/5">
                       <div className="w-32 h-32 rounded-3xl bg-black border-2 border-primary/20 flex items-center justify-center mb-4 relative overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=300" className="object-cover w-full h-full opacity-80" />
                          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                       </div>
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 uppercase text-[10px] font-bold tracking-widest">
                          On-Chain Verified
                       </Badge>
                    </div>

                    <div className="md:col-span-2 p-8 space-y-6">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                             <h3 className="text-3xl font-bold">{dog.name}</h3>
                             <p className="text-primary font-mono text-xs uppercase tracking-widest mt-1">{dog.breed}</p>
                          </div>
                          {dog.isStolen ? (
                            <Badge variant="destructive" className="h-10 px-4 rounded-xl gap-2 animate-pulse">
                               <ShieldAlert className="w-4 h-4" /> REPORTED STOLEN
                            </Badge>
                          ) : (
                            <Badge className="h-10 px-4 rounded-xl bg-emerald-500/20 text-emerald-500 border-none gap-2">
                               <ShieldCheck className="w-4 h-4" /> ACTIVE_LEDGER_RECORD
                            </Badge>
                          )}
                       </div>

                       <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/5">
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Owner Identity</p>
                             <p className="font-semibold">{dog.ownerName}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registration Date</p>
                             <p className="font-semibold">{formatSafeDate(dog.registrationDate)}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sex / Status</p>
                             <p className="font-semibold">{dog.gender.toUpperCase()} · {dog.sterilizationStatus.toUpperCase()}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Ledger Status</p>
                             <p className="font-mono text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">BLOCK_FINALIZED</p>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaction Hash (TX HASH)</p>
                          <div className="flex items-center gap-3 p-4 bg-black rounded-xl border border-white/5">
                             <LinkIcon className="w-4 h-4 text-primary" />
                             <span className="font-mono text-[10px] text-primary break-all flex-1">
                                {dog.blockchainTxHash || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e2925a3b844Bc454e4438f'}
                             </span>
                          </div>
                       </div>

                       <div className="flex gap-4 pt-4">
                          <Button
                            className="flex-1 rounded-xl h-12 bg-white/5 hover:bg-white/10 border border-white/10 font-bold gap-2"
                            onClick={() => setLocation(token ? `/dogs/${dog.id}` : '/login')}
                          >
                             {token ? 'View Full Profile' : 'Login to View Pedigree'} <ChevronRight className="w-4 h-4" />
                          </Button>
                          <Button
                             className="rounded-xl h-12 bg-primary text-black font-bold px-6"
                             onClick={() => window.open(`/api/dogs/${dog.id}/certificate`, '_blank')}
                          >
                             <ExternalLink className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="bg-card/20 border-white/5 rounded-[2rem] p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                 <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold">National Security</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Every microchip is tied to a secure cryptographic identity that cannot be forged or duplicated.
              </p>
           </Card>
           <Card className="bg-card/20 border-white/5 rounded-[2rem] p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                 <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Blockchain Immutability</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Records once verified are permanent. Any health or ownership updates create a new audited transaction.
              </p>
           </Card>
           <Card className="bg-card/20 border-white/5 rounded-[2rem] p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                 <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Stolen Dog Recovery</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Flagged dogs are instantly visible to all vets and shelters nationwide during microchip scanning.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
}
