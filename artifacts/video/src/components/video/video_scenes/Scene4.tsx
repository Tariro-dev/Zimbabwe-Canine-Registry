import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShieldCheck, Stethoscope, ArrowRightLeft, AlertTriangle } from 'lucide-react';

const features = [
  {
    title: "Smart Registration",
    subtitle: "Microchip Verification",
    desc: "Scan any ISO standard microchip and instantly link it to a secure blockchain identity. Immutable and permanent.",
    icon: ShieldCheck
  },
  {
    title: "Health Records",
    subtitle: "Vet-Gated Entries",
    desc: "Vaccination history and medical records locked on-chain. Only authorized veterinarians can add new health data.",
    icon: Stethoscope
  },
  {
    title: "Ownership Transfer",
    subtitle: "Digital Handshake",
    desc: "Seamlessly transfer canine ownership between users through smart contracts. No more lost paper certificates.",
    icon: ArrowRightLeft
  },
  {
    title: "Anti-Theft Protocol",
    subtitle: "Network-Wide Alerts",
    desc: "Flag a dog as stolen. Any future vet scan or registry check instantly alerts the original owner and authorities.",
    icon: AlertTriangle
  }
];

export function Scene4() {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev < features.length - 1 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col z-10 p-[10vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/blockchain-nodes.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 20, ease: 'linear' }}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-between">
        {/* Left */}
        <div className="w-[35%] h-full flex flex-col justify-center">
          <motion.h2
            className="text-[3vw] font-display font-bold text-white mb-12 uppercase tracking-tight"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            Protocol <br /><span className="text-[var(--color-primary)]">Features</span>
          </motion.h2>

          <div className="flex flex-col gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-4 relative">
                <motion.div
                  className="absolute left-[-2vw] w-[0.3vw] bg-[var(--color-primary)]"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: activeFeature === idx ? '100%' : '0%',
                    opacity: activeFeature === idx ? 1 : 0
                  }}
                  transition={{ duration: 0.4 }}
                />
                <p className={`text-[1.5vw] font-mono uppercase tracking-widest transition-colors duration-500 ${
                  activeFeature === idx ? 'text-[var(--color-primary)]' : 'text-white/30'
                }`}>
                  0{idx + 1}. {feat.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="w-[55%] h-[60%] relative flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              className="absolute w-full border border-[var(--color-primary)]/30 bg-black/50 backdrop-blur-xl p-[4vw] rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-[15vw] h-[15vw] bg-[var(--color-primary)]/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10">
                {(() => {
                  const Icon = features[activeFeature].icon;
                  return (
                    <div className="w-[5vw] h-[5vw] rounded-full border border-[var(--color-primary)] flex items-center justify-center mb-6 text-[var(--color-primary)]">
                      <Icon className="w-[2.5vw] h-[2.5vw]" />
                    </div>
                  );
                })()}

                <h3 className="text-[2.5vw] font-display font-bold text-white leading-tight mb-2">
                  {features[activeFeature].title}
                </h3>
                <p className="text-[1.2vw] font-mono text-[var(--color-primary)] tracking-widest uppercase mb-6">
                  {features[activeFeature].subtitle}
                </p>
                <p className="text-[1.8vw] font-body text-white/70 leading-relaxed">
                  {features[activeFeature].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
