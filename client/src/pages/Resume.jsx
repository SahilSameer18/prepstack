import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaLink, FaCode, FaBriefcase, FaGraduationCap, FaUser, FaTrophy } from "react-icons/fa";
import { FiCheck, FiX, FiExternalLink, FiCompass, FiDownload, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { InlineSpinner } from "../components/ui/Skeletons";
import { sections, basics, roleVariants, exampleResume, goodHabits, commonProblems, tools } from "../data/resumeGuide";

// Icon and colour of each section card (the text itself is in data/resumeGuide.js)
const SECTION_LOOK = {
  contact: { icon: <FaUser />, color: "text-warn", bg: "bg-warn-solid/10" },
  education: { icon: <FaGraduationCap />, color: "text-info", bg: "bg-info-solid/10" },
  skills: { icon: <FaCode />, color: "text-ok", bg: "bg-ok-solid/10" },
  experience: { icon: <FaBriefcase />, color: "text-violet", bg: "bg-violet-solid/10" },
  projects: { icon: <FaCode />, color: "text-bad", bg: "bg-bad-solid/10" },
  honors: { icon: <FaTrophy />, color: "text-cyan", bg: "bg-cyan-solid/10" },
};

// One open-and-close card. The height animates to its real size, so long content is never cut off.
const Accordion = ({ title, look, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`luxury-card rounded-2xl overflow-hidden transition-colors duration-300 ${open ? "border-brand/50" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full p-5 flex items-center gap-4 text-left focus:outline-none cursor-pointer min-h-[44px]"
      >
        {look && <div className={`p-3 rounded-xl ${look.bg} ${look.color} text-base flex-shrink-0`}>{look.icon}</div>}
        <span className="font-display text-base sm:text-lg font-bold text-fg flex-1">{title}</span>
        <FaChevronDown className={`text-muted transition-transform duration-300 ${open ? "rotate-180 text-brand" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 border-t border-ink/[0.08] pt-5 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Label = ({ children, className = "text-brand" }) => (
  <p className={`font-ui text-xs uppercase tracking-wider font-semibold mb-2 ${className}`}>{children}</p>
);

const Example = ({ text }) => (
  <pre className="bg-scrim/60 border border-ink/[0.08] rounded-xl p-4 text-fg-3 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-ui selection:bg-brand/30">{text}</pre>
);

const SectionCard = ({ section }) => (
  <Accordion title={section.title} look={SECTION_LOOK[section.id]}>
    <div className="rounded-xl bg-brand/[0.04] border border-brand/20 p-4">
      <Label>What recruiters often look for</Label>
      <p className="text-fg-3 text-sm leading-relaxed">{section.recruiterScan}</p>
    </div>

    <ul className="space-y-2.5">
      {section.tips.map((tip) => (
        <li key={tip} className="flex items-start gap-2.5 text-fg-3 text-sm">
          <FiCheck className="text-brand mt-1 flex-shrink-0 text-xs" />
          <span>{tip}</span>
        </li>
      ))}
    </ul>

    <div>
      <Label>Weak and strong</Label>
      <div className="space-y-4">
        {section.beforeAfter.map((pair) => (
          <div key={pair.weak} className="space-y-2">
            <div className="rounded-xl bg-bad-solid/[0.04] border border-bad-solid/15 p-3">
              <p className="text-xs font-ui font-semibold text-bad mb-1">Weak</p>
              <p className="text-fg-3 text-sm whitespace-pre-wrap">{pair.weak}</p>
            </div>
            <div className="rounded-xl bg-ok-solid/[0.04] border border-ok-solid/15 p-3">
              <p className="text-xs font-ui font-semibold text-ok mb-1">Strong</p>
              <p className="text-fg-2 text-sm whitespace-pre-wrap">{pair.strong}</p>
            </div>
            <p className="text-muted text-xs leading-relaxed">{pair.why}</p>
          </div>
        ))}
      </div>
    </div>

    <div>
      <Label className="text-bad">Common mistakes</Label>
      <ul className="space-y-2">
        {section.mistakes.map((m) => (
          <li key={m} className="flex items-start gap-2.5 text-fg-3 text-sm">
            <FiX className="text-bad mt-1 flex-shrink-0 text-xs" />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <Label>Example (invented for illustration)</Label>
      <Example text={section.example} />
    </div>

    <p className="text-muted text-xs leading-relaxed">
      {section.analyzerNote}{" "}
      <Link to="/analyzer" className="text-brand hover:underline inline-flex items-center gap-1">Check yours with the Role Analyzer <FiArrowRight className="text-xs" /></Link>
    </p>
  </Accordion>
);

const BasicCard = ({ item }) => (
  <Accordion title={item.title}>
    {item.paragraphs.map((p) => (
      <p key={p} className="text-fg-3 text-sm leading-relaxed">{p}</p>
    ))}
    {item.steps && (
      <ol className="space-y-2">
        {item.steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3 text-sm text-fg-3">
            <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    )}
    {item.afterSteps && <p className="text-fg-3 text-sm leading-relaxed">{item.afterSteps}</p>}
  </Accordion>
);

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
    <div className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-10 pt-2">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg tracking-[-0.035em] mb-3">
          Resume guide for software roles
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          A step-by-step guide to a clear resume for a software job or internship, with weak and strong examples for every section. It is advice, not a promise of results.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3">
          <Link to="/analyzer" className="inline-flex items-center gap-1 text-sm text-brand hover:underline min-h-[44px]">Check your resume against a real job with the Role Analyzer <FiArrowRight className="text-xs" /></Link>
          <button
            type="button"
            onClick={downloadChecklist}
            disabled={downloading}
            className="inline-flex items-center gap-2 text-sm text-fg-3 hover:text-fg min-h-[44px] cursor-pointer disabled:cursor-not-allowed"
          >
            {downloading ? <InlineSpinner size={14} color="currentColor" /> : <FiDownload />} {downloading ? "Preparing..." : "Download the one-page checklist (PDF)"}
          </button>
        </div>
      </div>

      {/* Principle */}
      <div className="luxury-glass p-5 rounded-2xl mb-12 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
          <FiCompass className="text-base" />
        </div>
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold text-fg mb-1">One idea to keep in mind</h3>
          <p className="text-fg-3 text-xs sm:text-sm leading-relaxed">
            Your resume is a short proof of what you can do, not your life story. Each line should show something you built or changed, using tools you can explain.
          </p>
        </div>
      </div>

      {/* Basics */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-fg tracking-tight mb-1">Before you write</h2>
        <p className="text-muted text-xs sm:text-sm mb-6">Five short rules that apply to the whole resume.</p>
        <div className="space-y-4">
          {basics.map((item) => <BasicCard key={item.id} item={item} />)}
        </div>
      </div>

      {/* Section-by-section guide */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-fg tracking-tight mb-1">Section by section</h2>
        <p className="text-muted text-xs sm:text-sm mb-6">Open a section for tips, weak and strong examples, and common mistakes.</p>
        <div className="space-y-4">
          {sections.map((s) => <SectionCard key={s.id} section={s} />)}
        </div>
      </div>

      {/* Role variants */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-fg tracking-tight mb-1">If you are aiming for a specific role</h2>
        <p className="text-muted text-xs sm:text-sm mb-6">The same resume, with a different focus.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {roleVariants.map((v) => (
            <div key={v.role} className="luxury-card rounded-2xl p-5">
              <h3 className="font-display text-base font-bold text-fg mb-3">{v.role}</h3>
              <p className="text-xs font-ui font-semibold text-brand mb-1">Skills section</p>
              <p className="text-fg-3 text-sm leading-relaxed mb-3">{v.skills}</p>
              <p className="text-xs font-ui font-semibold text-brand mb-1">Projects</p>
              <p className="text-fg-3 text-sm leading-relaxed">{v.projects}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example resume */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-fg tracking-tight mb-1">A complete example</h2>
        <p className="text-muted text-xs sm:text-sm mb-4">This resume is fictional. The name, college, company and numbers are all invented.</p>
        <Accordion title="Show the example resume">
          <Example text={exampleResume} />
        </Accordion>
      </div>

      {/* Good habits and common problems */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-fg tracking-tight mb-6">Good habits and common problems</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="luxury-card rounded-2xl p-6 border-ok-solid/20">
            <h3 className="font-display text-base font-bold text-ok mb-4 flex items-center gap-2"><FiCheck className="text-ok text-sm" /> Good habits</h3>
            <ul className="space-y-3">
              {goodHabits.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-fg-3 text-xs sm:text-sm leading-relaxed">
                  <FiCheck className="text-ok flex-shrink-0 mt-1 text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="luxury-card rounded-2xl p-6 border-bad-solid/20">
            <h3 className="font-display text-base font-bold text-bad mb-4 flex items-center gap-2"><FiX className="text-bad text-sm" /> Common problems</h3>
            <ul className="space-y-3">
              {commonProblems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-fg-3 text-xs sm:text-sm leading-relaxed">
                  <FiX className="text-bad flex-shrink-0 mt-1 text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="luxury-glass p-7 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-xl mx-auto text-center mb-8">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-fg mb-2">Tools you can use</h3>
          <p className="text-muted text-xs sm:text-sm">Two options, not endorsements. Whichever you use, open the exported PDF and check it yourself.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-ink/[0.02] border border-ink/[0.08] hover:border-brand/50 hover:bg-ink/[0.04] transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-sm font-bold text-fg group-hover:text-brand transition-colors">{tool.name}</span>
                <FiExternalLink className="text-xs text-muted group-hover:text-fg transition-colors" />
              </div>
              <p className="text-xs text-muted leading-relaxed font-sans">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resume;
