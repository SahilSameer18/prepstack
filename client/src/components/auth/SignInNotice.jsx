import { Link, useLocation } from "react-router-dom";

// A short "sign in to save" message for a signed-out visitor who tries something that saves progress.
// `floating` pins it to the bottom of the screen so it is seen wherever on a long page the click happened.
export default function SignInNotice({ text = "Sign in to save your progress.", onClose, floating = false }) {
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search + location.hash);
  return (
    <div
      role="status"
      data-testid="sign-in-notice"
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-brand/25 bg-card px-4 py-3 text-sm text-fg shadow-lg ${
        floating ? "fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md" : ""
      }`}
    >
      <span className="flex-1">{text}</span>
      <Link to={`/login?returnTo=${returnTo}`} className="inline-flex min-h-[44px] items-center font-semibold text-brand">
        Sign in
      </Link>
      {onClose && (
        <button type="button" onClick={onClose} className="inline-flex min-h-[44px] items-center text-muted hover:text-fg">
          Close
        </button>
      )}
    </div>
  );
}
