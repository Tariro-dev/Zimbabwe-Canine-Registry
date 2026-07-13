import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/40 rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '110%',
                  opacity: 0
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 0.8, 0],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center">
            {/* Subtle Glow beneath logo */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[80px] rounded-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative z-10 w-32 h-32 mb-8"
            >
              <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain filter brightness-125" />
            </motion.div>

            {/* Text Overlay */}
            <div className="text-center relative z-10">
              <motion.h1
                className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-white uppercase mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                Zimbabwe Canine Registry
              </motion.h1>

              <motion.div
                className="h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent w-full mb-4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
              />

              <motion.p
                className="text-sm md:text-base text-primary/80 font-mono tracking-widest italic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                Protecting Identity. Preserving Pedigree. Building Trust.
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
