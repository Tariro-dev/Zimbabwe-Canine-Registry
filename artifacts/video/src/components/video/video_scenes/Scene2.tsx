import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/dog-tech.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 4 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[80vw]">
        <motion.div
          className="relative w-[20vw] h-[20vw] mb-8"
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, type: 'spring', stiffness: 100, damping: 20, delay: 0.5 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/icon.png`}
            alt="ZCR Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(201,168,76,0.6)]"
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-[var(--color-primary)]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: 2 }}
          />
        </motion.div>

        <motion.div className="overflow-hidden mb-4">
          <motion.h1
            className="text-[6vw] font-display font-bold text-white text-center leading-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            ZIMBABWE
          </motion.h1>
        </motion.div>
        <motion.div className="overflow-hidden">
          <motion.h1
            className="text-[6vw] font-display font-bold text-[var(--color-primary)] text-center leading-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
          >
            CANINE REGISTRY
          </motion.h1>
        </motion.div>

        <motion.div
          className="mt-12 border border-[var(--color-primary)]/30 bg-black/40 backdrop-blur-md px-8 py-4 rounded-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          <p className="text-[1.8vw] font-mono text-[var(--color-primary)] tracking-[0.2em] uppercase">
            Blockchain Meets Canine Identity
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
