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
      className={`flex items-start gap-3 bg-bad-solid/10 border border-bad-solid/25 rounded-xl px-4 py-3 ${className}`}
    >
      <FiAlertCircle className="text-bad flex-shrink-0 mt-0.5 text-base" />
      <p className="text-bad text-sm leading-snug flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-bad hover:text-bad transition-colors flex-shrink-0"
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
    <div className="w-20 h-20 rounded-2xl bg-bad-solid/10 border border-bad-solid/20 flex items-center justify-center">
      <FiAlertTriangle className="text-4xl text-bad" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-fg mb-2">Something went wrong</h2>
      <p className="text-muted text-sm max-w-sm">{message}</p>
    </div>
    <div className="flex items-center gap-3">
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-on-brand font-semibold text-sm hover:bg-brand-hover transition-all"
        >
          <FiRefreshCw className="text-sm" /> Try Again
        </button>
      )}
      {backTo && (
        <Link
          to={backTo}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink/[0.06] border border-ink/[0.1] text-fg-3 font-semibold text-sm hover:text-fg hover:bg-ink/[0.1] transition-all"
        >
          {backLabel}
        </Link>
      )}
    </div>
  </div>
);
