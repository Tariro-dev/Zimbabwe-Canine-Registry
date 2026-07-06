import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 1.2 }}
    >
      <motion.img
        src={`${import.meta.env.BASE_URL}images/scene1-bg.png`}
        alt="Silhouette"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 10, ease: 'linear' }}
      />

      <div className="relative z-10 w-full max-w-[80vw] mx-auto">
        <motion.div className="flex flex-col gap-6 text-left">
          <motion.h2
            className="text-[5vw] font-display font-bold text-white leading-tight uppercase tracking-tighter"
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Unverified dogs.
          </motion.h2>

          <motion.h2
            className="text-[5vw] font-display font-bold text-white/70 leading-tight uppercase tracking-tighter ml-[10vw]"
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 3 }}
          >
            No paper trail.
          </motion.h2>

          <motion.h2
            className="text-[5vw] font-display font-bold text-white/50 leading-tight uppercase tracking-tighter ml-[20vw]"
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 5 }}
          >
            Lost identities.
          </motion.h2>

          <motion.div
            className="mt-8 ml-[30vw]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 7.5 }}
          >
            <div className="w-[10vw] h-[2px] bg-[var(--color-primary)] mb-4" />
            <p className="text-[2vw] font-body text-[var(--color-primary)] tracking-widest uppercase">
              The system is broken.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
