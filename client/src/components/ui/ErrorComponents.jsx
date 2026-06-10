import React from "react";
import { FiAlertCircle, FiX, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * InlineErrorAlert
 * A dismissible banner for form / action errors.
 * Usage: <InlineErrorAlert message={error} onDismiss={() => setError(null)} />
 */
export const InlineErrorAlert = ({ message, onDismiss, className = "" }) => {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 ${className}`}
    >
      <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5 text-base" />
      <p className="text-red-300 text-sm leading-snug flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0"
        >
          <FiX className="text-sm" />
        </button>
      )}
    </motion.div>
  );
};

/**
 * PageErrorState
 * A full-page centered error state for data-fetch failures.
 * Usage: <PageErrorState message="..." backTo="/somewhere" backLabel="Go Back" onRetry={fn} />
 */
export const PageErrorState = ({
  message = "Something went wrong. Please try again.",
  backTo,
  backLabel = "Go Back",
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
      <FiAlertTriangle className="text-4xl text-red-400" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-gray-400 text-sm max-w-sm">{message}</p>
    </div>
    <div className="flex items-center gap-3">
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffa116] text-black font-semibold text-sm hover:bg-[#ffb84d] transition-all"
        >
          <FiRefreshCw className="text-sm" /> Try Again
        </button>
      )}
      {backTo && (
        <Link
          to={backTo}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-gray-300 font-semibold text-sm hover:text-white hover:bg-white/[0.1] transition-all"
        >
          {backLabel}
        </Link>
      )}
    </div>
  </div>
);
