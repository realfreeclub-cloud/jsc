import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { openWhatsApp } from '../../utils/appRedirect';

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after scrolling down slightly or after a few seconds
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={() => openWhatsApp()}
          className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.5)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:bg-[#128C7E] hover:scale-110 transition-all group flex items-center justify-center"
          title="Chat with us on WhatsApp"
        >
          <MessageCircle size={32} />
          
          {/* Tooltip */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-white text-slate-800 text-sm px-4 py-2 rounded-xl font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100 hidden md:block">
            Need Help? Chat with us
          </span>
          
          {/* Notification dot */}
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingWhatsApp;
