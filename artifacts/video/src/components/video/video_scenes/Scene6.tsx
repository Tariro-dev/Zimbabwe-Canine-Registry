import { motion } from 'framer-motion';

export function Scene6() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1.5 }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          className="relative w-[15vw] h-[15vw] mb-12"
          initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/icon.png`}
            alt="ZCR Logo"
            className="w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(201,168,76,0.8)]"
          />
        </motion.div>

        <div className="flex gap-8 mb-16 overflow-hidden">
          {['SECURE.', 'VERIFIED.', 'TRUSTED.'].map((word, idx) => (
            <motion.h2
              key={idx}
              className="text-[4vw] font-display font-bold text-white tracking-tight"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 1 + (idx * 0.2), ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.h2>
          ))}
        </div>

        <motion.div
          className="w-full max-w-[40vw] h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 2.5 }}
        />

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3 }}
        >
          <p className="text-[1.2vw] font-mono text-[var(--color-primary)] tracking-[0.2em] uppercase">
            Zimbabwe Canine Registry
          </p>
          <p className="text-[1vw] font-body text-white/50 tracking-widest uppercase">
            Invented by Thamsanqa Zwana • Midlands State University
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
