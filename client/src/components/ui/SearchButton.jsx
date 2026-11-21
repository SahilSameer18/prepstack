import { MagnifyingGlass } from "@phosphor-icons/react";

// Opens the Ctrl+K "Jump to" box (CommandPalette listens for this event). A pill with the shortcut on wide screens, an icon on narrow ones.
export const OPEN_PALETTE_EVENT = "prepstack:open-palette";
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

export default function SearchButton({ compact = false }) {
  const open = () => document.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
  return compact ? (
    <button
      type="button"
      onClick={open}
      aria-label="Search pages"
      title="Search pages"
      className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-fg-3 transition-colors duration-300 hover:bg-ink/[0.07] hover:text-fg"
    >
      <MagnifyingGlass aria-hidden="true" />
    </button>
  ) : (
    <button
      type="button"
      onClick={open}
      aria-label={`Search pages, shortcut ${isMac ? "Command K" : "Control K"}`}
      title="Search pages"
      className="flex h-9 items-center gap-2 rounded-full border border-ink/[0.15] px-3 text-sm text-fg-3 transition-colors duration-300 hover:border-ink/[0.3] hover:text-fg"
    >
      <MagnifyingGlass aria-hidden="true" className="text-base" />
      <span>Search</span>
      <kbd className="rounded-md border border-ink/[0.15] px-1.5 py-0.5 font-code text-xs text-muted">{isMac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}
