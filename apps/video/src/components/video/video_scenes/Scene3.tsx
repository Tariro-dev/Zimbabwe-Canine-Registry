import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: '-10%', filter: 'blur(10px)' }}
      transition={{ duration: 1.2 }}
    >
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/microchip-glow.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 8, ease: 'easeOut' }}
      />

      <div className="w-[80vw] h-[80vh] flex items-center relative">
        {/* Left Column */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center relative">
          <motion.div
            className="w-[15vw] h-[15vw] border-2 border-[var(--color-primary)]/40 rotate-45 absolute"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 45 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="w-[18vw] h-[18vw] border border-[var(--color-primary)]/20 rotate-45 absolute"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 45 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            style={{ borderStyle: 'dashed' }}
          />

          <motion.div
            className="absolute w-[8vw] h-[3vw] bg-black border border-[var(--color-primary)] shadow-[0_0_20px_rgba(201,168,76,0.3)] flex items-center justify-center overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <div className="w-full h-[1px] bg-[var(--color-primary)] opacity-50 shadow-[0_0_10px_var(--color-primary)]" />
            <motion.div
              className="absolute w-[2px] h-full bg-white shadow-[0_0_10px_white]"
              animate={{ left: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <svg className="absolute w-[30vw] h-[30vw] pointer-events-none overflow-visible" viewBox="0 0 100 100">
            <motion.path
              d="M50 50 L100 20 M50 50 L100 80 M50 50 L80 100 M50 50 L80 0 M50 50 L20 0 M50 50 L20 100"
              stroke="var(--color-primary)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={phase >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Right Column */}
        <div className="w-1/2 pl-12 flex flex-col justify-center">
          <motion.p
            className="font-mono text-[var(--color-primary)] text-[1.5vw] tracking-[0.3em] mb-4 uppercase"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            ISO Standard
          </motion.p>

          <motion.h2
            className="text-[4.5vw] font-display font-bold text-white leading-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            A physical chip.<br />
            <span className="text-[var(--color-primary)]">A digital identity.</span>
          </motion.h2>

          <div className="space-y-6">
            {[
              { label: "Breed Lineage", delay: 2.6 },
              { label: "Health Records", delay: 2.9 },
              { label: "Ownership Data", delay: 3.2 }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-6"
                initial={{ opacity: 0, x: -30 }}
                animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.6, delay: item.delay - 2.5 }}
              >
                <div className="w-[3vw] h-[3vw] rounded-full border border-[var(--color-primary)]/50 flex items-center justify-center">
                  <div className="w-[1vw] h-[1vw] bg-[var(--color-primary)] rounded-full" />
                </div>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--color-primary)]/50 to-transparent" />
                <p className="text-[2vw] font-body text-white w-48">{item.label}</p>

                <motion.div
                  className="px-3 py-1 bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 rounded text-[1vw] font-mono text-[var(--color-primary)]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: (item.delay - 2.5) + 0.3 }}
                >
                  LOCKED
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
