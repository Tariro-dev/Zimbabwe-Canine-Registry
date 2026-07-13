import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Mail, Lock, Phone, MapPin, Upload, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const steps = [
  { id: 1, name: 'Personal Details', icon: User },
  { id: 2, name: 'Account Security', icon: Lock },
  { id: 3, name: 'Verification', icon: ShieldCheck }
];

export default function Register() {
  const [step, setStep] = React.useState(1);
  const [, setLocation] = useLocation();

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-primary/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card/30 backdrop-blur-3xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8 md:p-12">
          {/* Logo & Header */}
          <div className="text-center mb-12">
             <img src="/favicon.svg" alt="Logo" className="w-12 h-12 mx-auto mb-6 brightness-125" />
             <h2 className="text-3xl font-bold tracking-tight">Create Registry Identity</h2>
             <p className="text-muted-foreground mt-2 font-medium">Join the national canine blockchain network.</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
             {steps.map((s, i) => (
                <React.Fragment key={s.id}>
                   <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'border-white/10 text-muted-foreground'}`}>
                         {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>{s.name}</span>
                   </div>
                   {i < steps.length - 1 && (
                      <div className={`h-[2px] w-12 rounded-full transition-all duration-500 mb-6 ${step > s.id ? 'bg-primary' : 'bg-white/10'}`} />
                   )}
                </React.Fragment>
             ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px]">
             <AnimatePresence mode="wait">
                {step === 1 && (
                   <motion.div
                     key="step1"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <RegInput label="Full Name" placeholder="John Doe" icon={User} />
                         <RegInput label="Email Address" placeholder="john@example.com" icon={Mail} />
                         <RegInput label="Phone Number" placeholder="+263 7..." icon={Phone} />
                         <RegInput label="National ID" placeholder="08-XXXXXX-X00" icon={ShieldCheck} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registry Role</label>
                         <Select>
                            <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/30">
                               <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-white/10">
                               <SelectItem value="owner">Dog Owner</SelectItem>
                               <SelectItem value="breeder">Verified Breeder</SelectItem>
                               <SelectItem value="vet">Veterinarian</SelectItem>
                               <SelectItem value="regulator">Registry Official</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                   </motion.div>
                )}

                {step === 2 && (
                   <motion.div
                     key="step2"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                      <RegInput label="Security Password" type="password" placeholder="••••••••••••" icon={Lock} />
                      <RegInput label="Confirm Password" type="password" placeholder="••••••••••••" icon={Lock} />
                      <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
                         <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                            <h4 className="font-bold">Two-Factor Authentication</h4>
                         </div>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                            We recommend enabling 2FA to protect your canine assets. A verification code will be sent to your mobile device.
                         </p>
                         <Button variant="outline" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10">Enable 2FA Now</Button>
                      </div>
                   </motion.div>
                )}

                {step === 3 && (
                   <motion.div
                     key="step3"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6 text-center"
                   >
                      <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center mx-auto mb-8 group hover:bg-primary/20 transition-all cursor-pointer">
                         <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-bold uppercase mt-2 text-primary">Upload Photo</span>
                      </div>
                      <h3 className="text-xl font-bold">Verification Pending</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed italic">
                         By clicking submit, you agree to the National Canine Registry Terms of Service and data privacy policies.
                      </p>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-left space-y-3">
                         <div className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary" /> Identity check passed</div>
                         <div className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-primary" /> National database link active</div>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>

             {/* Footer Buttons */}
             <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="gap-2 rounded-xl text-muted-foreground hover:text-primary transition-colors"
                >
                   <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                {step < 3 ? (
                  <Button type="button" onClick={handleNext} className="gap-2 rounded-2xl bg-white/10 hover:bg-primary hover:text-black font-bold h-12 px-8 transition-all">
                     Next Step <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-black font-bold h-12 px-10 shadow-xl shadow-primary/20 transition-all active:scale-95">
                     Finalize Registration
                  </Button>
                )}
             </div>
          </form>
        </div>
      </motion.div>

      <div className="mt-10 text-center">
         <p className="text-muted-foreground font-medium">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
         </p>
      </div>
    </div>
  );
}

function RegInput({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2 group">
       <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">{label}</label>
       <div className="relative">
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            {...props}
            className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/30 transition-all"
          />
       </div>
    </div>
  );
}
