import React, { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { House, MagnifyingGlass, ArrowRight, CalendarCheck, ListChecks, BookOpenText, MapTrifold } from "@phosphor-icons/react";
import PageBackdrop from "../components/ui/PageBackdrop";
import { AuthEnter, Item } from "../components/auth/AuthShell";
import { roadmaps } from "../data/roadmaps";

// Every place a lost visitor might want, so the "Jump to" box can find it by a few letters.
const DESTINATIONS = [
  { label: "My plan", to: "/my-plan" },
  { label: "DSA sheets", to: "/dsa" },
  ...[["Blind 75", "blind-75"], ["NeetCode 150", "neetcode-150"], ["Striver SDE", "striver-sde"], ["Striver A2Z", "striver-a2z"], ["Love Babbar", "love-babbar"]]
    .map(([name, slug]) => ({ label: `DSA sheet: ${name}`, to: `/dsa/${slug}` })),
  { label: "CS notes", to: "/notes" },
  ...[["Operating Systems", "os"], ["DBMS", "dbms"], ["Computer Networks", "cn"], ["OOP in Java", "oops"], ["System Design", "hld"]]
    .map(([name, slug]) => ({ label: `Notes: ${name}`, to: `/notes/${slug}` })),
  { label: "Roadmaps", to: "/roadmaps" },
  ...roadmaps.map((r) => ({ label: `Roadmap: ${r.title}`, to: `/roadmaps/${r.slug}` })),
  { label: "Role Analyzer", to: "/analyzer" },
  { label: "AI projects", to: "/ai-projects" },
  { label: "Behavioral prep", to: "/behavioral" },
  { label: "Resume guide", to: "/resume" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Terms of use", to: "/terms" },
];

const QUICK = [
  { label: "My plan", text: "Build a study plan", to: "/my-plan", icon: CalendarCheck },
  { label: "DSA sheets", text: "Practise problems", to: "/dsa", icon: ListChecks },
  { label: "CS notes", text: "OS, DBMS, networks", to: "/notes", icon: BookOpenText },
  { label: "Roadmaps", text: "Step-by-step paths", to: "/roadmaps", icon: MapTrifold },
];

// Type a few letters, pick with the arrow keys and Enter (or click). A small, keyboard-friendly way back to the product.
function JumpTo() {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = words.length ? DESTINATIONS.filter((d) => words.every((w) => d.label.toLowerCase().includes(w))).slice(0, 6) : [];
  const open = results.length > 0;

  function onKeyDown(event) {
    if (event.key === "ArrowDown" && open) { event.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (event.key === "ArrowUp" && open) { event.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); }
    else if (event.key === "Enter" && open) { event.preventDefault(); navigate(results[Math.min(active, results.length - 1)].to); }
    else if (event.key === "Escape") setQuery("");
  }

  return (
    <div className="relative mx-auto w-full max-w-md text-left">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-ink/[0.14] bg-card px-5 shadow-[0_18px_34px_-22px_color-mix(in_srgb,var(--shadow)_40%,transparent)] transition-[border-color,box-shadow] duration-150 focus-within:border-brand focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_12%,transparent)]">
        <MagnifyingGlass aria-hidden="true" className="shrink-0 text-xl text-muted" />
        <input
          type="text"
          role="combobox"
          aria-label="Jump to a page"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${listId}-${Math.min(active, results.length - 1)}` : undefined}
          autoComplete="off"
          placeholder="Jump to… try notes, plan or blind"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKeyDown}
          className="auth-field-input w-full bg-transparent text-base text-fg placeholder-faint outline-none"
        />
      </div>
      {open && (
        <ul id={listId} role="listbox" aria-label="Matching pages" className="surface-card fade-in absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden p-1.5 shadow-2xl">
          {results.map((d, i) => (
            <li key={d.to} id={`${listId}-${i}`} role="option" aria-selected={i === Math.min(active, results.length - 1)}>
              <Link
                to={d.to}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-[44px] items-center justify-between gap-3 rounded-xl px-3.5 text-sm transition-colors ${i === Math.min(active, results.length - 1) ? "bg-brand/12 font-semibold text-brand" : "text-fg-3"}`}
              >
                {d.label}
                <ArrowRight aria-hidden="true" className="shrink-0 text-sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const NotFound = () => (
  <div className="relative">
    <PageBackdrop />
    {/* a quiet oversized 404 behind the words, like a watermark */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 select-none font-display text-[14rem] font-black leading-none tracking-[-0.06em] text-ink/[0.045] sm:text-[22rem]"
    >
      404
    </span>

    <AuthEnter className="relative z-10 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-2 pb-12 pt-6 text-center">
      <Item>
        <p className="font-ui text-sm font-semibold text-fg-3">Error 404</p>
      </Item>
      <Item>
        <h1 className="mt-3 font-display text-5xl font-black leading-[1.02] tracking-[-0.04em] text-fg sm:text-6xl lg:text-7xl">
          Page not <span className="text-brand">found.</span>
        </h1>
      </Item>
      <Item>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
          Looks like you took a wrong turn. The page you&apos;re looking for doesn&apos;t exist or might have been moved.
        </p>
      </Item>
      <Item className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="amber-specular-button inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-bold">
          <House aria-hidden="true" /> Go Home
        </Link>
        <Link to="/dsa" className="titanium-button inline-flex min-h-[48px] items-center rounded-xl px-6 text-sm font-medium">
          Explore DSA Sheets
        </Link>
      </Item>
      <Item className="relative z-30 mt-10 w-full">
        <JumpTo />
      </Item>
      <Item className="mt-12 w-full">
        <p className="mb-4 font-ui text-sm font-semibold text-fg-3">Or try</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to} className="surface-card surface-card-link p-5 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-xl text-brand">
                  <Icon weight="duotone" aria-hidden="true" />
                </span>
                <p className="mt-4 font-display text-base font-extrabold tracking-tight text-fg">{q.label}</p>
                <p className="mt-0.5 text-sm text-muted">{q.text}</p>
              </Link>
            );
          })}
        </div>
      </Item>
    </AuthEnter>
  </div>
);

export default NotFound;
