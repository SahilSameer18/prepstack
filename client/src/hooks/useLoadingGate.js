import { useEffect, useState } from 'react';

// Decides what to show while something loads, so a quick load never flashes a placeholder:
//   'blank'    the first `delay` ms: show nothing
//   'skeleton' after that, and for `hold` ms after the data arrives: the placeholder
//   'ready'    the real content
export function useLoadingGate(loading, { delay = 150, hold = 200 } = {}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShown(loading), loading ? delay : hold);
    return () => clearTimeout(timer);
  }, [loading, delay, hold]);
  if (loading) return shown ? 'skeleton' : 'blank';
  return shown ? 'skeleton' : 'ready';
}
