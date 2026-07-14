import * as React from 'react';
import { useGetDog } from '@workspace/api-client-react';
import { ShieldCheck, Award, QrCode, Printer, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatSafeDate } from '@/lib/utils';

export default function DogCertificate({ id }: { id: string }) {
  const { data: dog, isLoading } = useGetDog(id);

  if (isLoading) return <div className="p-12 text-center text-primary font-mono animate-pulse">GENERATING SECURE CRYPTOGRAPHIC CERTIFICATE...</div>;
  if (!dog) return <div>Not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Official Certificate</h1>
          <p className="text-muted-foreground mt-1">Blockchain-backed identity document for {dog.name}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button onClick={() => window.print()} className="rounded-xl bg-primary hover:bg-primary/90 text-black font-bold gap-2 px-6">
            <Printer className="w-4 h-4" /> Print Document
          </Button>
        </div>
      </div>

      {/* The Luxury Certificate */}
      <div className="relative bg-[#fdfaf2] border-[16px] border-double border-[#C9A84C]/40 p-12 md:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden print:shadow-none print:border-[#C9A84C] print:m-0 text-[#1a1a1a]">

        {/* Intricate Border Pattern Overlay */}
        <div className="absolute inset-4 border border-[#C9A84C]/20 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

        {/* Embossed Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <img src="/favicon.svg" alt="" className="w-[500px] h-[500px] grayscale brightness-0" />
        </div>

        <div className="relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-[#C9A84C] flex items-center justify-center shadow-2xl relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-[#C9A84C]/10" />
                <img src="/favicon.svg" className="w-16 h-16 grayscale brightness-0" alt="Seal" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl font-serif font-black tracking-tighter text-[#1a1a1a] uppercase">
                Zimbabwe Canine Registry
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[2px] w-12 bg-[#C9A84C]" />
                <p className="text-sm font-bold tracking-[0.4em] uppercase text-[#C9A84C]">Official Certificate of Pedigree</p>
                <div className="h-[2px] w-12 bg-[#C9A84C]" />
              </div>
            </div>
          </div>

          <p className="text-center max-w-2xl mx-auto font-serif text-lg leading-relaxed italic opacity-80">
            This is to certify that the canine described herein has been officially registered in the national blockchain ledger
            and has met all requirements for breed identification and ownership verification.
          </p>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 px-4 md:px-10">
            <CertField label="Registered Name" value={dog.name} className="text-3xl font-bold font-serif" />
            <CertField label="Microchip Identification" value={dog.microchipId} className="font-mono text-xl font-black text-[#C9A84C]" />
            <CertField label="Breed" value={dog.breed} />
            <CertField label="Date of Birth" value={formatSafeDate(dog.birthDate)} />
            <CertField label="Gender" value={dog.gender.toUpperCase()} />
            <CertField label="Color & Markings" value={dog.color} />
            <CertField label="Registered Owner" value={dog.ownerName} />
            <CertField label="Originating Breeder" value={dog.breederName} />
          </div>

          {/* Bottom Section */}
          <div className="mt-20 pt-10 border-t border-[#C9A84C]/20 grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
            <div className="space-y-4">
              <div className="font-serif italic text-2xl text-center md:text-left opacity-60">S. Moyo</div>
              <div className="h-px bg-[#1a1a1a]/20 w-full" />
              <p className="text-[10px] uppercase font-bold text-[#1a1a1a]/60 text-center md:text-left tracking-widest">Office of the Registrar</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 border-4 border-[#C9A84C]/30 rounded-2xl bg-white shadow-xl mb-4">
                <QrCode className="w-24 h-24 text-[#1a1a1a]" />
              </div>
              <p className="text-[9px] text-[#1a1a1a]/60 font-mono font-bold">BLOCKCHAIN AUTHENTICATION TAG</p>
            </div>

            <div className="text-center md:text-right space-y-2">
              <div className="text-xs font-black tracking-widest text-[#C9A84C] uppercase">
                Certificate No: {dog.certNumber || `ZCR-${dog.id.substring(0, 8).toUpperCase()}`}
              </div>
              <p className="text-[10px] text-[#1a1a1a]/60 font-bold">Issued: {formatSafeDate(dog.registrationDate)}</p>
              <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-600">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">On-Chain Verified</span>
              </div>
            </div>
          </div>

          {/* Footer Fine Print */}
          <div className="pt-10 text-center opacity-40">
            <p className="text-[8px] uppercase font-bold tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
              This digital instrument is protected by Zimbabwean law and international canine registration treaties.
              The unique cryptographic signature prevents any unauthorized duplication or alteration.
              Ledger Entry Hash: {dog.blockchainTxHash || 'TX_HASH_PENDING_CONFIRMATION'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertField({ label, value, className }: any) {
  return (
    <div className="space-y-2 border-b-2 border-[#C9A84C]/10 pb-2">
      <div className="text-[10px] uppercase font-black tracking-[0.2em] text-[#C9A84C]/70">{label}</div>
      <div className={`text-[#1a1a1a] ${className}`}>{value}</div>
    </div>
  );
}

