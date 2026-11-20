import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { flushSync } from "react-dom";
import { applyTheme, currentTheme, hasSavedTheme, saveTheme, systemTheme } from "../../utils/theme";

// Sun in the dark theme (switch to light), moon in the light theme. Follows the system until the visitor chooses.
// The switch grows the new theme out of the button as a circle (View Transitions); other browsers and
// reduced-motion settings just switch.
export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(currentTheme);
  const button = useRef(null);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!query) return undefined;
    const follow = () => {
      if (hasSavedTheme()) return;
      applyTheme(systemTheme());
      setTheme(currentTheme());
    };
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, []);

  const next = theme === "light" ? "dark" : "light";

  function toggle() {
    const change = () => { saveTheme(next); flushSync(() => setTheme(next)); };
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || calm) return change();
    const box = button.current.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(change);
    // never leave the page half-switched: if the circle has not finished in 1.2 s (a slow machine), jump to the end
    const rescue = setTimeout(() => transition.skipTransition(), 1200);
    transition.finished.finally(() => clearTimeout(rescue));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: "cubic-bezier(0.23, 1, 0.32, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }, () => {});
    return undefined;
  }

  return (
    <button
      ref={button}
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg text-fg-3 transition-colors hover:bg-ink/[0.07] hover:text-fg ${className}`}
    >
      {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </button>
  );
}
