import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { InlineSpinner } from './Skeletons';
import { useLoadingGate } from '../../hooks/useLoadingGate';

// While signing out: clicks are blocked at once, but the message only appears if it takes more than a moment.
export const LogoutOverlay = ({ isOpen }) => {
  const calm = useReducedMotion();
  const visible = useLoadingGate(isOpen, { delay: 250, hold: 350 }) === 'skeleton';
  if (!isOpen && !visible) return null;
  return (
    <div className="fixed inset-0 z-[9999] select-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            role="status"
            aria-live="polite"
            className="flex h-full w-full items-center justify-center bg-scrim/12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="surface-card flex items-center gap-3 !rounded-full px-6 py-3.5"
              initial={calm ? false : { transform: 'translate3d(0, 8px, 0) scale(0.96)' }}
              animate={{ transform: 'translate3d(0, 0, 0) scale(1)' }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <InlineSpinner size={18} color="var(--brand)" />
              <span className="font-ui text-sm font-semibold text-fg">Signing you out…</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
