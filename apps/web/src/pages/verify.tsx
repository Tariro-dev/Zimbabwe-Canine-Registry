import * as React from 'react';
import { useSearchDogByMicrochip, useListDogs } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ScanLine, AlertCircle, Filter, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Verify() {
  const [query, setQuery] = React.useState('');
  const [submittedQuery, setSubmittedQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ breed: '', gender: '' });
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [, setLocation] = useLocation();

  const { data: dog, isLoading, error } = useSearchDogByMicrochip(
    { microchip: submittedQuery },
    { query: { enabled: !!submittedQuery, retry: false } as any }
  );

  const { data: allDogs, isLoading: isFiltering } = useListDogs();

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

  React.useEffect(() => {
    if (dog) {
      setLocation(`/dogs/${dog.id}`);
    }
  }, [dog, setLocation]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <ScanLine className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Registry Verification</h1>
        <p className="text-lg text-muted-foreground">Verify canine identity and health status on the national blockchain.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Microchip Search */}
        <Card className="md:col-span-2 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Quick Microchip Look-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter 15-digit Microchip ID"
                  className="pl-12 h-14 text-lg font-mono tracking-widest bg-muted/50"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={15}
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8" disabled={isLoading || !query}>
                {isLoading ? "Checking..." : "Verify"}
              </Button>
            </form>

            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium text-sm">No record found. This microchip is not currently registered.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <Card className="shadow-sm border-border bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Breed</label>
              <Select onValueChange={(v) => setFilters(f => ({ ...f, breed: v }))}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="All Breeds" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boerboel">Boerboel</SelectItem>
                  <SelectItem value="Rhodesian Ridgeback">Rhodesian Ridgeback</SelectItem>
                  <SelectItem value="German Shepherd">German Shepherd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Gender</label>
              <Select onValueChange={(v) => setFilters(f => ({ ...f, gender: v }))}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Any Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Results */}
      {(filters.breed || filters.gender) && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Public Registry Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDogs?.map((dog) => (
              <Link key={dog.id} href={`/dogs/${dog.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">{dog.name}</div>
                      <div className="text-xs text-muted-foreground">{dog.breed}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
