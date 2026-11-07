import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiShield } from 'react-icons/fi';

export const LogoutOverlay = ({ isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] bg-scrim/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
        >
          {/* Ambient background glow */}
          <div className="absolute w-72 h-72 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-card-hover border border-ink/[0.08] rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl shadow-scrim/80 flex flex-col items-center gap-5"
          >
            {/* Animated Icon Container */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-brand/10 border border-brand/30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-brand/20 to-transparent flex items-center justify-center text-brand text-2xl border border-ink/10">
                <FiLogOut className="animate-bounce" />
              </div>
            </div>

            {/* Text & Message */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-fg tracking-tight">Signing Out</h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                Clearing your session and security tokens safely...
              </p>
            </div>

            {/* Progress line indicator */}
            <div className="w-full h-1 bg-ink/[0.06] rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-brand to-transparent rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
