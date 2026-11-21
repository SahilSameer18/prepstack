import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { matchDestinations } from "../data/destinations";

// Ctrl+K (or Cmd+K) opens a small "Jump to" box anywhere: type a few letters, arrow keys and Enter, Escape closes and focus goes back.
// It is one dialog that stays mounted and closed, so the shortcut works on every page.
export default function CommandPalette() {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const returnFocus = useRef(null);
  const listId = useId();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = matchDestinations(query, 7);
  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        returnFocus.current = document.activeElement;
        setQuery("");
        setActive(0);
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) { dialog.showModal(); inputRef.current?.focus(); }
    if (!open && dialog.open) { dialog.close(); returnFocus.current?.focus?.(); }
  }, [open]);

  const go = (to) => { setOpen(false); navigate(to); };

  function onKeyDown(event) {
    if (event.key === "ArrowDown" && results.length) { event.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (event.key === "ArrowUp" && results.length) { event.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); }
    else if (event.key === "Enter" && results.length) { event.preventDefault(); go(results[current].to); }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Jump to a page"
      onCancel={(event) => { event.preventDefault(); setOpen(false); }}
      onClick={(event) => { if (event.target === dialogRef.current) setOpen(false); }}
      className="command-palette surface-card m-auto mt-[12vh] w-[calc(100%-2rem)] max-w-lg overflow-hidden p-0 text-left text-fg shadow-2xl backdrop:bg-scrim/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-14 items-center gap-3 border-b border-ink/[0.1] px-5">
        <MagnifyingGlass aria-hidden="true" className="shrink-0 text-xl text-muted" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Jump to a page"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${current}` : undefined}
          autoComplete="off"
          placeholder="Jump to… try notes, plan or blind"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          className="auth-field-input w-full bg-transparent text-base text-fg placeholder-faint outline-none"
        />
        <span className="hidden shrink-0 rounded-md border border-ink/[0.15] px-1.5 py-0.5 font-code text-xs text-muted sm:block">Esc</span>
      </div>
      <ul id={listId} role="listbox" aria-label="Matching pages" className="max-h-[50vh] overflow-y-auto p-1.5">
        {results.map((d, i) => (
          <li key={d.to} id={`${listId}-${i}`} role="option" aria-selected={i === current}>
            <button
              type="button"
              onClick={() => go(d.to)}
              onMouseEnter={() => setActive(i)}
              className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 text-left text-sm transition-colors ${i === current ? "bg-brand/12 font-semibold text-brand" : "text-fg-3"}`}
            >
              {d.label}
              <ArrowRight aria-hidden="true" className="shrink-0 text-sm" />
            </button>
          </li>
        ))}
        {query.trim() && results.length === 0 && <li className="px-3.5 py-4 text-sm text-muted">No page matches. Try fewer letters.</li>}
        {!query.trim() && <li className="px-3.5 py-4 text-sm text-muted">Type a few letters of a page, sheet, note or roadmap.</li>}
      </ul>
    </dialog>
  );
}
