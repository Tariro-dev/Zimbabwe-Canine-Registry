import { motion } from 'framer-motion';

export function PersistentBackground({ currentScene }: { currentScene: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '4vw 4vw'
        }}
      />

      {/* Global Glowing Orbs */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 mix-blend-screen"
        style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}
        animate={{
          x: currentScene === 0 ? '-20vw' : currentScene === 2 ? '20vw' : currentScene === 4 ? '50vw' : '10vw',
          y: currentScene === 1 ? '10vh' : currentScene === 3 ? '-20vh' : '40vh',
          scale: currentScene === 5 ? 1.5 : 1,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full blur-[120px] opacity-10 mix-blend-screen right-0 bottom-0"
        style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        animate={{
          x: currentScene === 1 ? '10vw' : currentScene === 3 ? '-30vw' : '0vw',
          y: currentScene === 0 ? '0vh' : currentScene === 2 ? '20vh' : '-10vh',
          scale: currentScene === 5 ? 2 : 1,
        }}
        transition={{ duration: 5, ease: "easeInOut" }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}
