import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuraAIChat from './AuraAIChat.jsx';

export default function AuraAIChatDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Slide-over Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg h-full bg-[#070B14] shadow-2xl border-l border-white/10 z-10 flex flex-col"
        >
          <AuraAIChat isDrawer={true} onClose={onClose} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
