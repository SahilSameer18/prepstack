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
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
        >
          {/* Ambient background glow */}
          <div className="absolute w-72 h-72 rounded-full bg-[#ffa116]/10 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-[#111] border border-white/[0.08] rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl shadow-black/80 flex flex-col items-center gap-5"
          >
            {/* Animated Icon Container */}
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-[#ffa116]/10 border border-[#ffa116]/30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#ffa116]/20 to-transparent flex items-center justify-center text-[#ffa116] text-2xl border border-white/10">
                <FiLogOut className="animate-bounce" />
              </div>
            </div>

            {/* Text & Message */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white tracking-tight">Signing Out</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Clearing your session and security tokens safely...
              </p>
            </div>

            {/* Progress line indicator */}
            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#ffa116] to-transparent rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
