import * as React from 'react';
import { useListDogs, Dog } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Search, Filter, ShieldAlert, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Registered Dogs</h1>
          <p className="text-muted-foreground mt-1">Browse the full blockchain registry.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, breed, or microchip..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="animate-pulse h-48"></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
          {filteredDogs.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed rounded-lg bg-card/50">
              <p className="text-muted-foreground">No dogs found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DogCard({ dog }: { dog: Dog }) {
  return (
    <Card className="hover:border-primary/50 transition-colors group">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link href={`/dogs/${dog.id}`}>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {dog.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground font-medium">{dog.breed}</p>
          </div>
          {dog.isStolen ? (
            <Badge variant="destructive" className="gap-1.5"><ShieldAlert className="w-3 h-3"/> Stolen</Badge>
          ) : dog.blockchainSyncStatus === 'confirmed' ? (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 gap-1.5 border-emerald-500/20">
              <ShieldCheck className="w-3 h-3"/> Verified
            </Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Microchip:</span>
            <span className="font-mono text-foreground">{dog.microchipId}</span>
          </div>
          <div className="flex justify-between">
            <span>Owner:</span>
            <span className="text-foreground">{dog.ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Registered:</span>
            <span className="text-foreground">{format(new Date(dog.registrationDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border flex justify-end">
          <Link 
            href={`/dogs/${dog.id}`} 
            className="text-sm font-medium text-primary hover:underline"
          >
            View Full Profile &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
