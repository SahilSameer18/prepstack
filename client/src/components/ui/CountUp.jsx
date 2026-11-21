import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

// A whole number that counts up once, the first time it is seen (slow motion: about 0.9 s). Reduced motion: the final number at once.
// `format` turns the running number into text (for example thousands separators).
const CountUp = ({ value, format = (n) => String(n), duration = 0.9 }) => {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const calm = useReducedMotion();
  const [shown, setShown] = useState(calm ? value : 0);

  useEffect(() => {
    if (calm) { setShown(value); return undefined; }
    if (!seen) return undefined;
    const controls = animate(0, value, { duration, ease: [0.23, 1, 0.32, 1], onUpdate: (n) => setShown(Math.round(n)) });
    return () => controls.stop();
  }, [seen, value, calm, duration]);

  return <span ref={ref}>{format(shown)}</span>;
};

export default CountUp;
