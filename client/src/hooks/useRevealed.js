import { useState, useEffect } from 'react';

// True once the element has been on screen. Backs the scroll-in fades.
// Two checks, so a card can never stay invisible: the browser's IntersectionObserver, and a plain position
// check on load, on scroll and after 1.2 s (some browsers and zoom levels miss the observer's signal).
export function useRevealed(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };
    const check = () => { if (onScreen()) setSeen(true); };
    check();
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) setSeen(true); }, { threshold: 0.1 });
    io.observe(el);
    window.addEventListener('scroll', check, { passive: true });
    const timer = setTimeout(check, 1200);
    return () => { io.disconnect(); window.removeEventListener('scroll', check); clearTimeout(timer); };
  }, [ref, seen]);
  return seen;
}
