import { useState } from "react";
import { Link } from "react-router-dom";
import { DownloadSimple, ArrowRight, Check, X, ArrowUpRight } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { InlineSpinner } from "../components/ui/Skeletons";
import Accordion from "../components/ui/Accordion";
import PageBackdrop from "../components/ui/PageBackdrop";
import { useActiveHeading } from "../hooks/useActiveHeading";
import { sections, basics, roleVariants, exampleResume, goodHabits, commonProblems, tools } from "../data/resumeGuide";

const OUTLINE = [
  { id: "basics", label: "Before you write" },
  { id: "sections", label: "Section by section" },
  { id: "roles", label: "For a specific role" },
  { id: "example", label: "A complete example" },
  { id: "habits", label: "Habits and problems" },
  { id: "tools", label: "Tools you can use" },
];

const Label = ({ children, className = "text-brand" }) => (
  <p className={`mb-3 font-code text-xs uppercase tracking-[0.14em] ${className}`}>{children}</p>
);

const Example = ({ text }) => (
  <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-ink/[0.08] bg-ink/[0.03] p-4 font-ui text-xs leading-relaxed text-fg-3 selection:bg-brand/30">{text}</pre>
);

const SectionHeading = ({ id, title, text }) => (
  <>
    <h2 id={id} className="scroll-mt-24 font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h2>
    {text && <p className="mb-6 mt-2 text-base leading-relaxed text-muted">{text}</p>}
  </>
);

const SectionCard = ({ section }) => (
  <Accordion flat title={section.title}>
    <div className="rounded-xl bg-brand/[0.07] p-4">
      <Label>What recruiters often look for</Label>
      <p className="text-sm leading-relaxed text-fg-3">{section.recruiterScan}</p>
    </div>

    <ul className="space-y-2.5">
      {section.tips.map((tip) => (
        <li key={tip} className="flex items-start gap-2.5 text-sm text-fg-3">
          <Check weight="bold" className="mt-1 shrink-0 text-xs text-brand" aria-hidden="true" />
          <span>{tip}</span>
        </li>
      ))}
    </ul>

    <div>
      <Label className="text-fg-3">Weak and strong</Label>
      <div className="space-y-4">
        {section.beforeAfter.map((pair) => (
          <div key={pair.weak} className="space-y-2">
            <div className="rounded-xl bg-bad-solid/[0.05] p-3">
              <p className="mb-1 font-ui text-xs font-semibold text-bad">Weak</p>
              <p className="whitespace-pre-wrap text-sm text-fg-3">{pair.weak}</p>
            </div>
            <div className="rounded-xl bg-ok-solid/[0.05] p-3">
              <p className="mb-1 font-ui text-xs font-semibold text-ok">Strong</p>
              <p className="whitespace-pre-wrap text-sm text-fg-2">{pair.strong}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted">{pair.why}</p>
          </div>
        ))}
      </div>
    </div>

    <div>
      <Label className="text-bad">Common mistakes</Label>
      <ul className="space-y-2">
        {section.mistakes.map((m) => (
          <li key={m} className="flex items-start gap-2.5 text-sm text-fg-3">
            <X weight="bold" className="mt-1 shrink-0 text-xs text-bad" aria-hidden="true" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <Label className="text-fg-3">Example (invented for illustration)</Label>
      <Example text={section.example} />
    </div>

    <p className="text-sm leading-relaxed text-muted">
      {section.analyzerNote}{" "}
      <Link to="/analyzer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">Check yours with the Role Analyzer <ArrowRight className="text-xs" aria-hidden="true" /></Link>
    </p>
  </Accordion>
);

const BasicCard = ({ item }) => (
  <Accordion flat title={item.title}>
    {item.paragraphs.map((p) => (
      <p key={p} className="text-sm leading-relaxed text-fg-3">{p}</p>
    ))}
    {item.steps && (
      <ol className="space-y-2">
        {item.steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3 text-sm text-fg-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    )}
    {item.afterSteps && <p className="text-sm leading-relaxed text-fg-3">{item.afterSteps}</p>}
  </Accordion>
);

const OnThisPage = () => {
  const active = useActiveHeading(OUTLINE.map((o) => o.id));
  return (
    <nav aria-label="On this page" className="text-left">
      <p className="mb-2 font-ui text-xs font-bold text-fg-3">On this page</p>
      <ol className="space-y-0.5 border-l border-ink/[0.1] pl-3">
        {OUTLINE.map((o) => (
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
  );
};

const Resume = () => {
  const [downloading, setDownloading] = useState(false);

  const downloadChecklist = async () => {
    setDownloading(true);
    try {
      const { exportResumeChecklistPdf } = await import("../utils/exportResumeChecklistPdf");
      await exportResumeChecklistPdf();
    } catch {
      toast.error("Could not make the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 text-left sm:px-6 xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-12">
        <div className="min-w-0">
          {/* Header */}
          <div className="mb-10 pt-2">
            <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
              Resume guide for software roles.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              A step-by-step guide to a clear resume for a software job or internship, with weak and strong examples for every section. It is advice, not a promise of results.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/analyzer" className="amber-specular-button inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 text-sm font-bold">
                Check your resume with the Role Analyzer <ArrowRight aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={downloadChecklist}
                disabled={downloading}
                className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border border-ink/[0.14] px-5 text-sm font-semibold text-fg transition-colors hover:bg-ink/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? <InlineSpinner size={14} color="currentColor" /> : <DownloadSimple aria-hidden="true" />} {downloading ? "Preparing..." : "One-page checklist (PDF)"}
              </button>
            </div>
          </div>

          {/* Principle */}
          <div className="mb-14 rounded-2xl bg-brand/[0.07] p-6 sm:p-8">
            <p className="mb-2 font-ui text-sm font-semibold text-brand">One idea to keep in mind</p>
            <p className="max-w-2xl text-lg leading-relaxed text-fg-2">
              Your resume is a short proof of what you can do, not your life story. Each line should show something you built or changed, using tools you can explain.
            </p>
          </div>

          {/* Basics */}
          <div className="mb-14">
            <SectionHeading id="basics" title="Before you write" text="Five short rules that apply to the whole resume." />
            <div className="border-t border-ink">
              {basics.map((item) => <BasicCard key={item.id} item={item} />)}
            </div>
          </div>

          {/* Section-by-section guide */}
          <div className="mb-14">
            <SectionHeading id="sections" title="Section by section" text="Open a section for tips, weak and strong examples, and common mistakes." />
            <div className="border-t border-ink">
              {sections.map((s) => <SectionCard key={s.id} section={s} />)}
            </div>
          </div>

          {/* Role variants */}
          <div className="mb-14">
            <SectionHeading id="roles" title="If you are aiming for a specific role" text="The same resume, with a different focus." />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {roleVariants.map((v) => (
                <div key={v.role} className="border-t border-ink pt-5">
                  <h3 className="mb-3 font-display text-lg font-bold tracking-tight text-fg">{v.role}</h3>
                  <p className="mb-1 font-ui text-xs font-bold text-brand">Skills section</p>
                  <p className="mb-3 text-sm leading-relaxed text-fg-3">{v.skills}</p>
                  <p className="mb-1 font-ui text-xs font-bold text-brand">Projects</p>
                  <p className="text-sm leading-relaxed text-fg-3">{v.projects}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example resume */}
          <div className="mb-14">
            <SectionHeading id="example" title="A complete example" text="This resume is fictional. The name, college, company and numbers are all invented." />
            <Accordion flat title="Show the example resume">
              <Example text={exampleResume} />
            </Accordion>
          </div>

          {/* Good habits and common problems */}
          <div className="mb-14">
            <SectionHeading id="habits" title="Good habits and common problems" />
            <div className="mt-6 grid gap-x-12 gap-y-10 md:grid-cols-2">
              <div className="border-t border-ink pt-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ok"><Check weight="bold" className="text-base" aria-hidden="true" /> Good habits</h3>
                <ul className="space-y-3">
                  {goodHabits.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-fg-3">
                      <Check weight="bold" className="mt-1 shrink-0 text-xs text-ok" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-ink pt-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold tracking-tight text-bad"><X weight="bold" className="text-base" aria-hidden="true" /> Common problems</h3>
                <ul className="space-y-3">
                  {commonProblems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-fg-3">
                      <X weight="bold" className="mt-1 shrink-0 text-xs text-bad" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h2 id="tools" className="scroll-mt-24 font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">Tools you can use</h2>
            <p className="mb-6 mt-2 text-base text-muted">Two options, not endorsements. Whichever you use, open the exported PDF and check it yourself.</p>
            <div className="border-t border-ink">
              {tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border-b border-ink/[0.1] py-5 transition-colors hover:bg-ink/[0.02]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-fg transition-colors group-hover:text-brand">{tool.name}</span>
                    <ArrowUpRight className="text-sm text-muted transition-colors group-hover:text-brand" aria-hidden="true" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted">{tool.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Wide screens: the parts of the page, with the one being read highlighted */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 pt-14">
            <OnThisPage />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Resume;
