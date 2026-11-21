import { useEffect, useState } from "react";

// A thin amber line under the top edge that fills slowly while a page's code is downloading.
// It waits 150 ms first, so a quick page change shows nothing at all.
export default function TopProgress() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
      <div className="top-progress-bar h-full w-full" style={{ background: "var(--brand-grad-bottom)" }} />
    </div>
  );
}

// What the router shows while the next page downloads: the line, and a space so the page does not collapse
export const RouteFallback = () => (
  <div className="min-h-[60vh]" role="status" aria-label="Loading page">
    <TopProgress />
  </div>
);
