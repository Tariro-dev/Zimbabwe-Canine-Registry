import * as React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Github, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useLocation } from 'wouter';

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-stretch overflow-hidden">
      {/* Left Side: Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=1500"
          alt="Login Dog"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

        <div className="absolute bottom-20 left-20 max-w-lg z-10 space-y-6">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 1 }}
           >
              <img src="/favicon.svg" alt="Logo" className="w-16 h-16 mb-8 brightness-125" />
              <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                The National Standard for <span className="gold-text-gradient">Canine Integrity</span>
              </h1>
              <p className="text-xl text-white/60 font-medium italic">
                "Securing our pedigree heritage through cryptographic proof and national consensus."
              </p>
           </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-20 relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-muted-foreground font-medium">Please enter your credentials to access the registry.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
               <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <Input
                       type="email"
                       placeholder="name@organization.com"
                       className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/30 transition-all text-lg"
                       required
                     />
                  </div>
               </div>

               <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-colors">Security Password</label>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <Input
                       type={showPassword ? "text" : "password"}
                       placeholder="••••••••••••"
                       className="pl-12 pr-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/30 transition-all text-lg"
                       required
                     />
                     <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                     >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black" />
                  <label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">Remember device</label>
               </div>
               <Link href="/forgot-password text-sm font-bold text-primary hover:underline">Forgot Password?</Link>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black font-bold text-lg shadow-xl shadow-primary/10 transition-transform active:scale-95">
               Authenticate Account
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-[0.2em] text-muted-foreground bg-[#020202] px-4">Secure Social Sign-in</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2">
                <Globe className="w-4 h-4 text-primary" /> Google
             </Button>
             <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Microsoft
             </Button>
          </div>

          <div className="text-center pt-4">
             <p className="text-muted-foreground font-medium">
                New to the registry? <Link href="/register" className="text-primary font-bold hover:underline">Create an Identity</Link>
             </p>
          </div>
        </motion.div>

        {/* System Info Bottom */}
        <div className="absolute bottom-10 text-center opacity-30 text-[10px] font-mono tracking-widest uppercase">
          National Canine Database // v4.0.1 // encrypted_session_active
        </div>
      </div>
    </div>
  );
}
