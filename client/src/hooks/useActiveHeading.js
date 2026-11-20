import { useState, useEffect } from 'react';

// Which heading is being read: the last one in the list whose top has passed under the navbar.
// Used by the "On this page" lists of the notes and the roadmaps.
export function useActiveHeading(ids) {
  const [active, setActive] = useState(ids[0] || null);
  const key = ids.join('|');
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0] || null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // the list of ids changes only with the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}
