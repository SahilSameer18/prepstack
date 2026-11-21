import { motion } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import { TICK_SQUEEZE, SPRING } from "../../utils/motion";

// The one square tick: an empty box, or a filled brand box with a check. The caller supplies the button or label around it.
// Put `group` on the parent to get the darker edge on hover. When `done` changes the box squeezes and settles (not on first paint).
const Tick = ({ done }) => (
  <motion.span
    aria-hidden="true"
    initial={false}
    animate={{ scale: done ? TICK_SQUEEZE : 1 }}
    transition={done ? { duration: 0.34 } : SPRING.snappy}
    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${done ? "border-brand bg-brand text-on-brand" : "border-ink/[0.3] bg-card group-hover:border-ink/[0.5]"}`}
  >
    {done && <Check weight="bold" className="text-xs" />}
  </motion.span>
);

export default Tick;
