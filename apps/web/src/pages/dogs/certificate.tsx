import * as React from 'react';
import { useGetDog } from '@workspace/api-client-react';
import { ShieldCheck, Award, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function DogCertificate({ id }: { id: string }) {
  const { data: dog, isLoading } = useGetDog(id);

  if (isLoading) return <div className="p-12 text-center">Generating secure certificate...</div>;
  if (!dog) return <div>Not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()} className="bg-primary text-primary-foreground">
          Download PDF / Print
        </Button>
      </div>

      <div className="bg-white border-[12px] border-double border-primary/20 p-12 rounded-sm shadow-2xl relative overflow-hidden print:shadow-none print:border-primary">
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-[500px] h-[500px]" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Zimbabwe Canine Registry</h1>
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-muted-foreground">Official Blockchain Certificate of Registration</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-full" />

          <div className="grid grid-cols-2 gap-y-12 gap-x-16">
            <CertField label="Registered Name" value={dog.name} className="text-2xl font-bold" />
            <CertField label="Breed" value={dog.breed} />
            <CertField label="Gender" value={dog.gender} />
            <CertField label="Color" value={dog.color} />
            <CertField label="Microchip Identification" value={dog.microchipId} className="font-mono" />
            <CertField label="Date of Birth" value={format(new Date(dog.birthDate || ''), 'PPP')} />
            <CertField label="Current Owner" value={dog.ownerName} />
            <CertField label="Registry ID" value={dog.id} className="font-mono text-xs" />
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 items-end">
            <div className="text-center space-y-2">
              <div className="h-px bg-black/20 w-full mb-4" />
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Registrar Signature</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-2 border border-border rounded-lg bg-white mb-2">
                <QrCode className="w-20 h-20 text-primary" />
              </div>
              <p className="text-[8px] text-muted-foreground font-mono">Verify at zcr.co.zw/verify</p>
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-bold text-primary">Certificate No: {dog.breederCertification?.certNumber || 'ZCR-000000'}</div>
              <p className="text-[10px] text-muted-foreground">Issued: {format(new Date(dog.registrationDate), 'PP')}</p>
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-[9px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              This document serves as an official record of registration on the ZCR Blockchain Ledger.
              The integrity of this record is cryptographically secured. Ownership transfers must be
              processed through the official ZCR portal to remain valid.
            </p>
            <div className="mt-4 font-mono text-[8px] opacity-30 truncate">
              TX: {dog.blockchainTxHash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertField({ label, value, className }: any) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</div>
      <div className={`border-b border-primary/10 pb-1 ${className}`}>{value}</div>
    </div>
  );
}
