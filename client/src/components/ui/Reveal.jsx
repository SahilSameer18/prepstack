import { createElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Fades and slides its content in: when it scrolls into view, or on page load with onLoad.
// With "reduce motion" on, it is just the plain element, so nothing moves.
export default function Reveal({ as = "div", children, delay = 0, x = 0, y = 18, onLoad = false, className }) {
  const calm = useReducedMotion();
  if (calm) return createElement(as, { className }, children);
  const shown = { opacity: 1, x: 0, y: 0 };
  return createElement(
    motion[as],
    {
      className,
      initial: { opacity: 0, x, y },
      ...(onLoad ? { animate: shown } : { whileInView: shown, viewport: { once: true, amount: 0.15 } }),
      transition: { duration: 0.6, ease: EASE, delay },
    },
    children,
  );
}
