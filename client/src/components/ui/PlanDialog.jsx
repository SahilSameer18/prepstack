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
      className="surface-card m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto p-6 text-fg shadow-2xl backdrop:bg-scrim/50 backdrop:backdrop-blur-sm sm:p-8"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 id={titleId} className="font-display text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        <button
          ref={closeRef}
          type="button"
          disabled={busy}
          onClick={onClose}
          className="min-h-[44px] shrink-0 cursor-pointer text-sm text-muted transition-colors hover:text-fg"
        >
          Cancel
        </button>
      </div>
      {children}
    </dialog>
  );
}
