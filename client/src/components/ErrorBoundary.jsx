import React from 'react';
import { WarningCircle, ArrowClockwise, House } from '@phosphor-icons/react';
import PageBackdrop from './ui/PageBackdrop';
import { CONTACT_EMAIL } from '../data/contact';

/**
 * ErrorBoundary: catches any uncaught render/lifecycle errors in the tree
 * and shows a calm fallback instead of a blank white screen.
 *
 * It must still work when the app itself is broken, so it uses no router, no context and no animation library:
 * plain links, the shared classes and the theme colours only.
 *
 * Wrap your entire <App /> (in main.jsx) with this component.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Nothing is sent anywhere: the visitor can email the details from the page if they choose to.
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = String(this.state.error?.message || 'Unknown error').slice(0, 400);
    const report = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('PrepStack error')}&body=${encodeURIComponent(
      `Page: ${window.location.pathname}\nWhat I was doing:\n\nError: ${message}`,
    )}`;

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-6 py-12 text-body">
        <PageBackdrop />
        <div role="alert" className="surface-card fade-in relative z-10 w-full max-w-lg p-8 text-center sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-bad-solid/25 bg-bad-solid/10 text-4xl text-bad">
            <WarningCircle weight="duotone" aria-hidden="true" />
          </span>
          <h1 className="mt-7 font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg">
            Something went wrong.
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-muted">
            Something unexpected broke on this page. Reloading usually fixes it. If it does not, go back to the home page.
          </p>

          {import.meta.env.DEV && (
            <pre className="mx-auto mt-5 max-w-md overflow-auto whitespace-pre-wrap break-words rounded-xl border border-bad-solid/20 bg-bad-solid/[0.06] p-3 text-left text-xs text-bad">
              {message}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="amber-specular-button inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl px-6 text-sm font-bold"
            >
              <ArrowClockwise aria-hidden="true" /> Reload this page
            </button>
            <a href="/" className="titanium-button inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-medium">
              <House aria-hidden="true" /> Back to home
            </a>
          </div>

          <p className="mt-8 text-sm text-muted">
            If this keeps happening, <a href={report} className="font-semibold text-brand hover:underline">email us the details</a>.
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
