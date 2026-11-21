import { useEffect, useState } from "react";

// The calm full-page loader (the session check, a page waiting for the signed-in user).
// One slow ring around the mark, and nothing at all for the first 150 ms.
const PageLoader = ({ message = "Loading..." }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center py-16">
      {show && (
        <div className="fade-in flex flex-col items-center gap-5">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span aria-hidden="true" className="loader-ring absolute inset-0 rounded-2xl border border-brand/50" />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 font-display text-2xl font-black text-brand">P</span>
          </span>
          <p className="font-ui text-sm text-muted">{message}</p>
        </div>
      )}
    </div>
  );
};

export default PageLoader;
