import React from "react";
import { WarningCircle, X, ArrowClockwise } from "@phosphor-icons/react";
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
      initial={{ opacity: 0, transform: "translate3d(0, -8px, 0)" }}
      animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      exit={{ opacity: 0, transform: "translate3d(0, -8px, 0)" }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-bad-solid/25 bg-bad-solid/10 px-4 py-3 ${className}`}
    >
      <WarningCircle weight="duotone" aria-hidden="true" className="mt-0.5 shrink-0 text-lg text-bad" />
      <p className="flex-1 text-sm leading-snug text-bad">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="shrink-0 text-bad transition-colors hover:text-fg"
        >
          <X aria-hidden="true" className="text-sm" />
        </button>
      )}
    </motion.div>
  );
};

/**
 * PageErrorState
 * A centred card for a page whose data could not be loaded, with the same card and buttons as the rest of the app.
 * Usage: <PageErrorState message="..." backTo="/somewhere" backLabel="Go Back" onRetry={fn} />
 */
// When the page gives no title, name what happened (a lost connection reads very differently from a bug).
const titleFor = (message) =>
  /reach the server/i.test(message) ? "Can't reach the server"
    : /took too long/i.test(message) ? "This is taking too long"
    : "Something went wrong";

export const PageErrorState = ({
  title,
  message = "Something went wrong. Please try again.",
  backTo,
  backLabel = "Go Back",
  onRetry,
}) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div role="alert" className="surface-card fade-in w-full max-w-md p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-bad-solid/25 bg-bad-solid/10 text-3xl text-bad">
        <WarningCircle weight="duotone" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-fg">{title || titleFor(message)}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="amber-specular-button inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-bold"
          >
            <ArrowClockwise aria-hidden="true" /> Try again
          </button>
        )}
        {backTo && (
          <Link
            to={backTo}
            className="titanium-button inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-medium"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  </div>
);
