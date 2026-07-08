import * as React from 'react';
import { useGetDog, useToggleDogStolen, getGetDogQueryKey, Dog, useGetMyProfile } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  ShieldCheck, ShieldAlert, Link as LinkIcon, FileCheck, 
  Activity, ArrowRight, Microchip, AlertTriangle, Dog as DogIcon,
  Share2, FileText
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PedigreeTree } from '@/components/pedigree-tree';
import { MediaGallery } from '@/components/media-gallery';
import { Link } from 'wouter';

export default function DogDetail({ id }: { id: string }) {
  const { data: dog, isLoading } = useGetDog(id);
  const { data: profile } = useGetMyProfile();
  const toggleStolen = useToggleDogStolen();
  const queryClient = useQueryClient();

  if (isLoading) {
    return <div className="p-8 text-center">Loading dog profile...</div>;
  }

  if (!dog) {
    return <div className="p-8 text-center text-destructive">Dog not found.</div>;
  }

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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{dog.name}</h1>
            {dog.isStolen && <Badge variant="destructive" className="text-sm px-3 py-1 uppercase tracking-wider"><AlertTriangle className="w-4 h-4 mr-2"/> Stolen</Badge>}
          </div>
          <p className="text-xl text-muted-foreground">{dog.breed} • {dog.gender}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link href={`/dogs/${dog.id}/certificate`}>
            <Button variant="outline"><FileText className="w-4 h-4 mr-2"/> View Certificate</Button>
          </Link>
          {(isOwner || isRegulator) && (
            <Button
              variant={dog.isStolen ? "outline" : "destructive"}
              onClick={handleToggleStolen}
              disabled={toggleStolen.isPending}
            >
              {dog.isStolen ? 'Mark as Safe' : 'Report Stolen'}
            </Button>
          )}
          {(isOwner || isRegulator) && (
            <Link href={`/dogs/${dog.id}/transfer`}>
              <Button variant="outline">Transfer Ownership</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Blockchain Trust Chain Visualization */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Trust Chain Verification</h3>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-border -translate-y-1/2 z-0"></div>
          
          <ChainNode 
            icon={Activity} 
            title="Microchip" 
            value={dog.microchipId}
            active={true}
          />
          <ArrowRight className="w-5 h-5 text-muted-foreground md:hidden" />
          <ChainNode 
            icon={LinkIcon} 
            title="Blockchain" 
            value={dog.blockchainSyncStatus}
            active={dog.blockchainSyncStatus === 'confirmed'}
            mono
          />
          <ArrowRight className="w-5 h-5 text-muted-foreground md:hidden" />
          <ChainNode 
            icon={DogIcon} 
            title="Lineage" 
            value={dog.sireMicrochip || dog.dameMicrochip ? 'Verified' : 'Unverified'}
            active={!!(dog.sireMicrochip || dog.dameMicrochip)}
          />
          <ArrowRight className="w-5 h-5 text-muted-foreground md:hidden" />
          <ChainNode 
            icon={FileCheck} 
            title="Certification" 
            value={dog.breederCertification?.status || 'None'}
            active={dog.breederCertification?.status === 'active'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Identity & Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Microchip ID" value={dog.microchipId} mono />
            <DetailRow label="Color" value={dog.color} />
            <DetailRow label="Birth Date" value={format(new Date(dog.birthDate), 'PP')} />
            <DetailRow label="Registration Date" value={format(new Date(dog.registrationDate), 'PP')} />
            <DetailRow label="Owner" value={dog.ownerName} />
            <DetailRow label="Breeder" value={dog.breederName} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Sterilization" value={dog.sterilizationStatus.replace('_', ' ')} />
            <DetailRow label="Vaccine History" value={dog.vaccineHistory} />
            {dog.weight && <DetailRow label="Weight" value={`${dog.weight} kg`} />}
            {dog.lastCheckup && <DetailRow label="Last Checkup" value={format(new Date(dog.lastCheckup), 'PP')} />}
            {dog.dnaHash && <DetailRow label="DNA Hash" value={dog.dnaHash} mono className="text-xs" />}
            
            {isVet && (
              <div className="pt-4 mt-2 border-t border-border">
                <Link href={`/dogs/${dog.id}/health`}>
                  <Button variant="outline" size="sm" className="w-full">Update Health Record</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <MediaGallery dogId={dog.id} />
        </div>

        <div className="md:col-span-2">
          <PedigreeTree dogId={dog.id} />
        </div>

        {dog.blockchainTxHash && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Blockchain Ledger Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
                <div className="font-mono text-primary text-sm whitespace-pre">{dog.blockchainTxHash}</div>
                <div className="mt-4 flex gap-8">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <Badge variant={dog.blockchainSyncStatus === 'confirmed' ? 'default' : 'secondary'} className="uppercase">
                      {dog.blockchainSyncStatus}
                    </Badge>
                  </div>
                  {dog.blockchainConfirmedAt && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Confirmed At</div>
                      <div className="text-sm">{format(new Date(dog.blockchainConfirmedAt), 'PP pp')}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ChainNode({ icon: Icon, title, value, active, mono }: any) {
  return (
    <div className="flex flex-col items-center z-10 bg-card px-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${active ? 'border-primary/20 bg-primary text-primary-foreground' : 'border-muted bg-muted text-muted-foreground'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className={`mt-1 text-sm ${mono ? 'font-mono' : 'font-medium'} ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{value}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, className }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-primary' : 'text-foreground'} ${className || ''}`}>
        {value}
      </span>
    </div>
  );
}
