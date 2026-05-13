import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-slate-200 border-t-gold rounded-full"
        />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-primary font-bold tracking-widest text-sm uppercase"
        >
          Loading
        </motion.p>
      </div>
    </div>
  );
};

export default PageLoader;
