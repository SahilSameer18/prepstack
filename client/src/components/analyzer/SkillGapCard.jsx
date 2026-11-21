import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";

// One skill the job asks for that the resume does not fully show: what PrepStack offers for it, then outside learning links.
// It sits right under the requirement row that names the skill and its status, so it repeats neither.
const SkillGapCard = ({ advice }) => (
  <div className="mt-4 rounded-xl bg-ink/[0.03] p-4 text-left">
    <p className="mb-1 text-sm font-semibold text-muted">How to close this gap</p>

    {advice.actions.length > 0 ? (
      <ul className="divide-y divide-ink/[0.08]">
        {advice.actions.map((a) => (
          <li key={a.kind + a.path}>
            <Link to={a.path} className="group flex min-h-[44px] items-center justify-between gap-3 text-sm text-fg-2 transition-colors hover:text-fg">
              <span className="leading-snug">{a.label}</span>
              <ArrowRight aria-hidden="true" className="shrink-0 text-brand transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="py-1 text-sm text-muted">PrepStack has no lessons for this yet. The links below are the best place to start.</p>
    )}

    {advice.resources.length > 0 && (
      <ul className="mt-2 divide-y divide-ink/[0.08] border-t border-ink/[0.08]">
        {advice.resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-[44px] items-center justify-between gap-3 break-words text-sm text-fg-2 transition-colors hover:text-fg">
              <span>{r.title} <span className="text-muted">({r.type === "video" ? "video" : "docs"})</span></span>
              <ArrowUpRight aria-hidden="true" className="shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default SkillGapCard;
