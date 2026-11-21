import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useActiveHeading } from "../../hooks/useActiveHeading";

// The frame of the two legal pages: backdrop, title, "last updated" line, the text, and on wide screens a
// "On this page" list that follows the section being read. The wording lives in the pages, not here.
const LegalLayout = ({ eyebrow, title, accent, updated, outline, children }) => {
  const active = useActiveHeading(outline.map((o) => o.id));
  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-left sm:px-6 xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-12">
        <div className="min-w-0 max-w-3xl">
          <Link to="/" className="group mb-4 inline-flex min-h-[44px] items-center gap-2 font-ui text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
            Back to PrepStack
          </Link>

          <header className="mb-10 border-b border-ink/[0.08] pb-8">
            <p className="mb-3 font-ui text-sm font-semibold text-fg-3">{eyebrow}</p>
            <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
              {title} {accent}
            </h1>
            <p className="mt-4 text-sm text-muted">{updated}</p>
          </header>

          <div className="space-y-12 text-base leading-relaxed text-fg-3">{children}</div>
        </div>

        <aside className="hidden xl:block">
          <nav aria-label="On this page" className="sticky top-24 pt-14">
            <p className="mb-2 font-ui text-xs font-bold text-fg-3">On this page</p>
            <ol className="space-y-0.5 border-l border-ink/[0.1] pl-3">
              {outline.map((o) => (
                <li key={o.id}>
                  <a
                    href={`#${o.id}`}
                    aria-current={active === o.id ? "location" : undefined}
                    className={`block py-1 text-sm leading-snug transition-colors ${active === o.id ? "font-semibold text-brand" : "text-muted hover:text-fg"}`}
                  >
                    {o.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </div>
  );
};

export default LegalLayout;
