import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

// One open-and-close card. The height animates to its real size, so long content is never cut off.
// look is optional: { icon, color, bg } draws a small coloured icon tile before the title.
const Accordion = ({ title, look, children }) => {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className={`luxury-card rounded-2xl overflow-hidden transition-colors duration-300 ${open ? "border-brand/50" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full p-5 flex items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand cursor-pointer min-h-[44px]"
      >
        {look && <div className={`p-3 rounded-xl ${look.bg} ${look.color} text-base flex-shrink-0`}>{look.icon}</div>}
        <span className="font-display text-base sm:text-lg font-bold text-fg flex-1">{title}</span>
        <FaChevronDown className={`text-muted transition-transform duration-300 ${open ? "rotate-180 text-brand" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 border-t border-ink/[0.08] pt-5 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
