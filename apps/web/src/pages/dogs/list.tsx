import * as React from 'react';
import { useListDogs, Dog } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import {
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  MoreHorizontal,
  Eye,
  FileText,
  QrCode,
  ArrowRightLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function DogsList() {
  const { data: dogs, isLoading } = useListDogs();
  const [search, setSearch] = React.useState('');

  const filteredDogs = React.useMemo(() => {
    if (!Array.isArray(dogs)) return [];
    if (!search) return dogs;
    const lower = search.toLowerCase();
    return dogs.filter(d => 
      d.name.toLowerCase().includes(lower) || 
      d.microchipId.toLowerCase().includes(lower) ||
      d.breed.toLowerCase().includes(lower)
    );
  }, [dogs, search]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">National Registry</h1>
          <p className="text-muted-foreground mt-2 text-lg">Browse and manage the full blockchain-backed canine database.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name, breed, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-card/30 border-white/5 rounded-2xl focus-visible:ring-primary/30"
            />
          </div>
          <Button className="h-12 w-12 md:w-auto md:px-6 rounded-2xl bg-primary hover:bg-primary/90 text-black font-bold gap-2 shadow-lg shadow-primary/10">
            <Plus className="w-5 h-5" /> <span className="hidden md:inline">Add Dog</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="animate-pulse h-[400px] bg-card/30 rounded-[2.5rem]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
          {filteredDogs.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-card/10">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DogCard({ dog }: { dog: Dog }) {
  return (
    <Card className="rounded-[2.5rem] bg-card/30 backdrop-blur-xl border-white/5 hover:border-primary/40 transition-all duration-500 group overflow-hidden shadow-2xl shadow-black/40">
      <div className="relative h-56 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=600`}
          alt={dog.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute top-4 right-4 flex gap-2">
           {dog.isStolen ? (
             <Badge variant="destructive" className="bg-red-500 text-white border-none shadow-lg px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest">
               <ShieldAlert className="w-3 h-3 mr-1.5" /> Stolen
             </Badge>
           ) : (
             <Badge className="bg-emerald-500 text-white border-none shadow-lg px-3 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest">
               <ShieldCheck className="w-3 h-3 mr-1.5" /> Verified
             </Badge>
           )}
        </div>

        <div className="absolute bottom-4 left-6">
           <h3 className="text-3xl font-bold text-white tracking-tight">{dog.name}</h3>
           <p className="text-primary font-mono text-xs uppercase tracking-[0.2em]">{dog.breed}</p>
        </div>
      </div>

      <CardContent className="p-8">
        <div className="grid grid-cols-2 gap-6 mb-8">
           <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Sex / Age</span>
              <p className="text-sm font-semibold">{dog.gender} • 2y 4m</p>
           </div>
           <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">ID Number</span>
              <p className="text-sm font-mono font-bold text-primary">{dog.microchipId}</p>
           </div>
           <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Owner</span>
              <p className="text-sm font-semibold truncate">{dog.ownerName}</p>
           </div>
           <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Blockchain</span>
              <p className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-tighter">CONFIRMED_TX</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Link href={`/dogs/${dog.id}`} className="flex-1">
              <Button className="w-full h-12 rounded-2xl bg-white/5 hover:bg-primary hover:text-black border border-white/10 transition-all font-bold gap-2">
                 <Eye className="w-4 h-4" /> View Profile
              </Button>
           </Link>

           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5">
                    <MoreHorizontal className="w-5 h-5" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-white/10 rounded-2xl p-2">
                 <DropdownMenuLabel className="text-xs uppercase font-bold tracking-widest text-muted-foreground px-3 py-2">Quick Actions</DropdownMenuLabel>
                 <DropdownMenuSeparator className="bg-white/5" />
                 <DropdownMenuItem className="rounded-xl gap-3 p-3 cursor-pointer">
                    <FileText className="w-4 h-4 text-primary" /> Print Certificate
                 </DropdownMenuItem>
                 <DropdownMenuItem className="rounded-xl gap-3 p-3 cursor-pointer">
                    <QrCode className="w-4 h-4 text-primary" /> Generate Passport QR
                 </DropdownMenuItem>
                 <DropdownMenuItem className="rounded-xl gap-3 p-3 cursor-pointer">
                    <ArrowRightLeft className="w-4 h-4 text-primary" /> Transfer Ownership
                 </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

