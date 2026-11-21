import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRevealed } from "../../hooks/useRevealed";

const EASE = [0.23, 1, 0.32, 1];
const at = (x, y) => `translate3d(${x}px, ${y}px, 0)`;

// Fades and slides its content in on page load (onLoad) or when it scrolls into view.
// spring: a small bounce for things that should feel alive. Reduce motion: a short fade, no movement.
// The full transform string (not the x/y shorthands) keeps it on the GPU while the page is busy.
export default function Reveal({ as = "div", children, delay = 0, x = 0, y = 18, onLoad = false, spring = false, className, ...rest }) {
  const calm = useReducedMotion();
  const ref = useRef(null);
  const seen = useRevealed(ref);
  const shown = { opacity: 1, transform: at(0, 0) };
  let transition = { duration: 0.8, ease: EASE, delay };
  if (onLoad) transition = { duration: 0.95, ease: EASE, delay };
  if (spring) transition = { type: "spring", duration: 1.0, bounce: 0.15, delay };
  if (calm) transition = { duration: 0.2, delay: 0 };
  const Tag = motion[as];
  return (
    <Tag
      ref={ref}
      className={className}
      {...rest}
      initial={calm ? { opacity: 0 } : { opacity: 0, transform: at(x, y) }}
      animate={onLoad || seen ? shown : undefined}
      transition={transition}
    >
      {children}
    </Tag>
  );
}
