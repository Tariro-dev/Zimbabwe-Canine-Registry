import { motion } from 'framer-motion';

const roles = [
  { role: "OWNERS", desc: "Digital proof of ownership & lineage" },
  { role: "BREEDERS", desc: "Litter pre-registration & verification" },
  { role: "VETS", desc: "Secure health record updates" },
  { role: "REGULATORS", desc: "Network oversight & compliance" }
];

export function Scene5() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.2 }}
    >
      <motion.div className="mb-16 text-center">
        <motion.p
          className="text-[1.5vw] font-mono text-[var(--color-primary)] tracking-[0.4em] uppercase mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Ecosystem Access
        </motion.p>
        <motion.h2
          className="text-[5vw] font-display font-bold text-white uppercase tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Four Roles. <span className="text-white/30">One Platform.</span>
        </motion.h2>
      </motion.div>

      <div className="flex justify-center gap-8 w-full max-w-[80vw]">
        {roles.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex-1 border border-[var(--color-primary)]/20 bg-gradient-to-b from-black/80 to-transparent p-8 rounded-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 + (idx * 0.2), type: 'spring', bounce: 0.2 }}
          >
            <motion.div
              className="absolute top-0 left-0 h-[2px] bg-[var(--color-primary)]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 1 + (idx * 0.2) }}
            />
            <h3 className="text-[2.2vw] font-display font-bold text-white mb-4">
              {item.role}
            </h3>
            <p className="text-[1.2vw] font-body text-white/60 leading-relaxed">
              {item.desc}
            </p>
            <div className="absolute bottom-4 right-4 w-[2vw] h-[2vw] border border-[var(--color-primary)]/30 rounded-full flex items-center justify-center">
              <div className="w-[0.5vw] h-[0.5vw] bg-[var(--color-primary)] rounded-full animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
