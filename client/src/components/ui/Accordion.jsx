import { useState, useId } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// One open-and-close card. The height animates to its real size, so long content is never cut off.
// icon is optional: a small tile before the title (one accent colour, so every card reads the same).
const Accordion = ({ title, icon, children }) => {
  const [open, setOpen] = useState(false);
  const calm = useReducedMotion();
  const panelId = useId();
  return (
    <div className={`overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ${open ? "border-ink/[0.16] shadow-[0_18px_34px_-24px_color-mix(in_srgb,var(--shadow)_45%,transparent)]" : "border-ink/[0.1] hover:border-ink/[0.2]"}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[44px] w-full cursor-pointer items-center gap-4 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand"
      >
        {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-xl text-brand">{icon}</span>}
        <span className="flex-1 font-display text-base font-extrabold tracking-tight text-fg sm:text-lg">{title}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition-[transform,color] duration-200 ${open ? "rotate-180 border-brand/30 bg-brand/10 text-brand" : "border-ink/[0.1] text-muted"}`}>
          <CaretDown aria-hidden="true" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={calm ? { duration: 0.15 } : { height: { type: "spring", duration: 0.3, bounce: 0 }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-ink/[0.08] px-5 pb-6 pt-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
