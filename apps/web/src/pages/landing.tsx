import * as React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  Users,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Star,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  ScanLine,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
  whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  const { scrollY } = useScroll();
  const navBgOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);
  const navBlur = useTransform(scrollY, [0, 100], [0, 16]);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#020202] overflow-x-hidden selection:bg-primary/30 text-white">
      {/* Navigation */}
      <motion.nav
        style={{
          backgroundColor: `rgba(2, 2, 2, ${navBgOpacity.get()})`,
          backdropFilter: `blur(${navBlur.get()}px)`,
          borderBottom: `1px solid rgba(255, 255, 255, ${scrollY.get() > 50 ? 0.1 : 0})`,
          boxShadow: scrollY.get() > 50 ? '0 10px 40px -10px rgba(0,0,0,0.7)' : 'none'
        }}
        className="fixed top-0 left-0 right-0 z-[1000] h-20 flex items-center px-6 md:px-12 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="ZCR" className="w-10 h-10 brightness-125" />
          <span className="font-bold text-lg tracking-tight uppercase hidden sm:inline-block">
            Zimbabwe Canine <span className="text-primary">Registry</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 ml-12">
          {['Home', 'Registry', 'Verification', 'Breeders', 'Health Records', 'Lost & Found', 'About'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="text-xs font-semibold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link href="/login" className="text-xs font-semibold uppercase tracking-widest text-foreground/70 hover:text-primary transition-colors hidden sm:block">
            Login
          </Link>
          <Button
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-lg shadow-primary/20"
            onClick={() => setLocation('/register')}
          >
            Get Started
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Hero Background with High-Res Photo (placeholder) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=2000"
            alt="German Shepherd"
            className="w-full h-full object-cover"
          />
          {/* Subtle Golden Sunrise Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10" />
        </div>

        {/* Floating Particles Background */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              animate={{
                y: [0, -1000],
                x: [0, Math.random() * 200 - 100],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 10
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: '110%'
              }}
            />
          ))}
        </div>

        <div className="container relative z-20 px-6 md:px-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mb-6"
            >
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-primary font-mono text-sm tracking-[0.3em] uppercase">National Standard</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
              Zimbabwe's Official <br />
              <span className="gold-text-gradient">Digital Canine Registry</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl font-medium">
              A secure national registry for pedigree certification, ownership verification,
              breeder accreditation, veterinary records and blockchain-backed canine identity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg transition-transform hover:scale-105 active:scale-95"
                onClick={() => setLocation('/register')}
              >
                Register Your Dog
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 rounded-full border-primary/50 hover:bg-primary/10 text-white font-bold text-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
                onClick={() => setLocation('/verify')}
              >
                Verify Certificate
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-white/60">
              {[
                { icon: ShieldCheck, label: 'Secure Registry' },
                { icon: ScanLine, label: 'Blockchain Protected' },
                { icon: Search, label: 'ISO Microchip Ready' },
                { icon: CheckCircle2, label: 'National Database' }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <badge.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-widest">{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="registry" className="py-24 px-6 md:px-12 bg-[#050505] relative overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <motion.p {...fadeInUp} className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">The Process</motion.p>
            <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">How It Works</motion.h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />

            {[
              { title: 'Register', desc: 'Securely enter your canine and owner details into the national ledger.', icon: ClipboardCheck },
              { title: 'Microchip', desc: 'Link a unique ISO standard microchip for permanent digital identification.', icon: ScanLine },
              { title: 'Verify', desc: 'Instant blockchain verification of ownership and health status anywhere.', icon: ShieldCheck },
              { title: 'Transfer', desc: 'Seamlessly transfer ownership with secure digital certificates.', icon: Users },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                className="relative z-10 group"
              >
                <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed italic">{step.desc}</p>

                    <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[#050505] border border-primary/20 flex items-center justify-center font-mono text-primary font-bold shadow-lg">
                  0{idx + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ZCR */}
      <section className="py-24 px-6 md:px-12 bg-background relative overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeInUp}
              className="relative rounded-3xl overflow-hidden aspect-[4/5] md:aspect-video lg:aspect-square"
            >
              <div className="absolute inset-0 bg-primary/10 z-10 mix-blend-overlay" />
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000"
                alt="Veterinarian"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl z-20 border border-white/10">
                <p className="text-white font-medium italic">"The ZCR system has revolutionized how we track canine health records across Zimbabwe."</p>
                <p className="text-primary font-bold mt-2">— Dr. Simba Moyo, Vet Association</p>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div {...fadeInUp}>
                <p className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">Establishing Credibility</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Why Zimbabwe Canine Registry?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We are building a digital infrastructure that protects the integrity of Zimbabwean canine breeds
                  while providing owners and professionals with world-class tools.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  'National canine identification',
                  'Fraud prevention',
                  'Pedigree preservation',
                  'Secure ownership transfer',
                  'Breeder recognition',
                  'Veterinary integration',
                  'Emergency recovery',
                  'Blockchain backed'
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    {...fadeInUp}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-6 h-6 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-primary group-hover:text-black" />
                    </div>
                    <span className="font-semibold text-foreground/80">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#070707] border-y border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: 'Registered Dogs', value: '15,000+' },
              { label: 'Verified Breeders', value: '320+' },
              { label: 'Veterinary Clinics', value: '140+' },
              { label: 'Authenticity', value: '99.9%' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold gold-text-gradient mb-2">{stat.value}</h3>
                <p className="text-sm font-mono tracking-widest uppercase text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Breeders */}
      <section id="breeders" className="py-24 px-6 md:px-12 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <motion.p {...fadeInUp} className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">Elite Network</motion.p>
              <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">Featured Breeders</motion.h2>
              <motion.p {...fadeInUp} className="text-muted-foreground leading-relaxed">
                Connect with Zimbabwe's most reputable breeders, vetted for quality and ethical standards.
              </motion.p>
            </div>
            <Button variant="outline" className="rounded-full border-primary/50 text-primary hover:bg-primary/10">View All Breeders</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Kuvimba Kennels', breed: 'Rhodesian Ridgeback', loc: 'Harare', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400' },
              { name: 'Zambezi Boerboels', breed: 'South African Boerboel', loc: 'Bulawayo', img: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=400' },
              { name: 'Royal Shepherds', breed: 'German Shepherd', loc: 'Mutare', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400' }
            ].map((breeder, idx) => (
              <motion.div key={idx} {...fadeInUp} transition={{ delay: idx * 0.1 }}>
                <Card className="bg-card/30 border-white/5 hover:border-primary/30 transition-all overflow-hidden group shadow-xl shadow-black/20">
                  <div className="h-48 overflow-hidden relative">
                    <img src={breeder.img} alt={breeder.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-primary/30 flex items-center gap-2">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Top Rated</span>
                    </div>
                  </div>
                  <CardContent className="p-6 relative">
                    <div className="absolute -top-10 left-6 w-20 h-20 rounded-full border-4 border-[#0a0a0a] overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/150?u=${idx}`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="pt-10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">{breeder.name}</h3>
                        <div className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified</div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                        <MapPin className="w-4 h-4" /> {breeder.loc}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-[10px] uppercase font-bold tracking-tighter bg-white/5 border border-white/10 px-2 py-1 rounded">{breeder.breed}</span>
                      </div>
                      <Button className="w-full rounded-full border border-primary/50 bg-transparent hover:bg-primary text-primary hover:text-black font-bold transition-all">
                        Contact Breeder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lost and Found Section */}
      <section id="lost-found" className="py-24 px-6 md:px-12 bg-background relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <motion.div {...fadeInUp}>
                <p className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">Emergency Protocol</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Lost & Found Network</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Our national network instantly alerts shelters, veterinarians, and registry officials
                  when a dog is reported missing. Use our interactive map to see active alerts.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { label: 'Search by Breed', icon: Search },
                   { label: 'Search by Microchip', icon: QrCode },
                   { label: 'Location Tracking', icon: MapPin },
                   { label: 'Reward Distribution', icon: Star }
                 ].map((tool, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-card/30 border border-white/5 rounded-2xl">
                      <tool.icon className="w-6 h-6 text-primary" />
                      <span className="font-bold text-sm">{tool.label}</span>
                   </div>
                 ))}
              </div>

              <Button className="rounded-full bg-destructive hover:bg-destructive/90 text-white font-bold h-14 px-10 gap-2">
                 <AlertTriangle className="w-5 h-5" /> Report a Missing Dog
              </Button>
            </div>

            <div className="order-1 lg:order-2">
               <motion.div
                 {...fadeInUp}
                 className="relative aspect-square bg-[#0a0a0a] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl"
               >
                  {/* Mock Map Visualization */}
                  <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-0.1833,31.0333,12/800x800?access_token=pk.eyJ1IjoibW9ja3VwIiwiYSI6ImNrY200eG00ZTAwMXoycnM1ZzI0ZzB6ZzIifQ.0Z0Z0Z0Z0Z0Z0Z0Z0Z0Z0A')] bg-cover" />

                  {/* Animated Pulses for missing dogs */}
                  <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-destructive rounded-full">
                     <div className="absolute inset-0 bg-destructive rounded-full animate-ping" />
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-destructive rounded-full">
                     <div className="absolute inset-0 bg-destructive rounded-full animate-ping delay-700" />
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-2xl border border-white/10 flex items-center gap-6">
                     <div className="w-16 h-16 rounded-xl overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-destructive font-black text-[10px] uppercase tracking-widest">Active Alert</span>
                           <span className="text-[10px] text-muted-foreground font-mono">• 2h ago</span>
                        </div>
                        <h4 className="font-bold text-white">"Max" - Beagle</h4>
                        <p className="text-xs text-muted-foreground">Last seen: Avondale, Harare</p>
                     </div>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-12 bg-[#050505] relative overflow-hidden">
        <div className="container mx-auto text-center">
          <motion.p {...fadeInUp} className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-4">Community Voices</motion.p>
          <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-bold mb-16">Trusted by the Nation</motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "The most professional registry system I've ever used. The pedigree verification is airtight.", author: "Tariro Manyange", role: "Owner" },
              { text: "As a vet, having instant access to a dog's microchip and history is a game-changer for emergency care.", author: "Dr. K. Gumbo", role: "Veterinarian" },
              { text: "ZCR has brought transparency and prestige back to the Zimbabwean breeding community.", author: "Farai Choga", role: "Certified Breeder" }
            ].map((t, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <Card className="bg-white/5 border-white/10 p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-primary fill-primary" />)}
                    </div>
                    <p className="text-lg italic text-foreground/80 leading-relaxed mb-8">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {t.author.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{t.author}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">{t.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 px-6 md:px-12 bg-background border-t border-white/5">
        <div className="container mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-[0.5em] text-muted-foreground mb-12">Proud Strategic Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            {['Kennel Club', 'Veterinary Council', 'Ministry of Agriculture', 'Animal Welfare'].map((p) => (
              <div key={p} className="text-xl font-bold italic tracking-tighter text-foreground/50 hover:text-primary transition-colors cursor-default select-none">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020202] pt-24 pb-12 px-6 md:px-12 border-t border-primary/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <img src="/favicon.svg" alt="ZCR" className="w-12 h-12" />
                <span className="font-bold text-2xl tracking-tight uppercase">
                  ZCR <span className="text-primary">Registry</span>
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                The definitive national standard for canine identity and pedigree management in Zimbabwe.
                Securing our heritage, one microchip at a time.
              </p>
              <div className="flex items-center gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-primary hover:border-primary transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'About', links: ['Our Mission', 'Team', 'Governance', 'Careers'] },
              { title: 'Services', links: ['Registration', 'Verification', 'Breeder Tools', 'Lost & Found'] },
              { title: 'Support', links: ['Help Center', 'API Docs', 'Contact Us', 'Privacy Policy'] }
            ].map((col, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="font-bold text-white uppercase tracking-widest text-sm">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-mono">
                &copy; {new Date().getFullYear()} ZIMBABWE CANINE REGISTRY. ALL RIGHTS RESERVED.
              </p>
              <p className="text-[10px] text-white/20 font-mono mt-1 uppercase tracking-widest">
                canineregistry.co.zw • Hosted by GetHost Africa
              </p>
            </div>
            <div className="flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <a href="#" className="hover:text-primary">Terms</a>
              <a href="#" className="hover:text-primary">Privacy</a>
              <a href="#" className="hover:text-primary">Security</a>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary/50">
              <ShieldCheck className="w-4 h-4" />
              BLOCKCHAIN VERIFIED INFRASTRUCTURE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
