import { useEffect, useId, useRef } from "react";

// Native modal semantics, safe initial focus, Tab containment and focus restoration.
export default function PlanDialog({ title, children, onClose, busy = false }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    closeRef.current.focus();
    return () => {
      dialog.close();
      previousFocus?.focus();
    };
  }, []);

  function containTab(event) {
    if (event.key !== "Tab") return;
    const controls = [
      ...event.currentTarget.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [role="combobox"]',
      ),
    ];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onKeyDown={containTab}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-ink/[0.15] bg-card p-5 text-fg shadow-2xl backdrop:bg-scrim/80 sm:p-7"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          ref={closeRef}
          type="button"
          disabled={busy}
          onClick={onClose}
          className="min-h-[44px] shrink-0 text-sm text-muted"
        >
          Cancel
        </button>
      </div>
      {children}
    </dialog>
  );
}
