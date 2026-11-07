import { Link } from "react-router-dom";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";

// One skill the job asks for that the resume does not fully show: what PrepStack offers for it, then outside learning links.
// It sits right under the requirement row that names the skill and its status, so it repeats neither.
const SkillGapCard = ({ advice }) => (
  <div className="rounded-xl bg-card-hover border border-ink/[0.08] p-4 text-left">
    <p className="text-xs text-muted mb-2">How to close this gap</p>

    {advice.actions.length > 0 ? (
      <ul className="space-y-1.5">
        {advice.actions.map((a) => (
          <li key={a.kind + a.path}>
            <Link to={a.path} className="group flex items-center justify-between gap-3 rounded-lg bg-ink/[0.03] hover:bg-ink/[0.07] border border-ink/[0.06] px-3 py-2.5 min-h-[44px] text-xs text-fg-2 transition-colors">
              <span className="leading-snug">{a.label}</span>
              <FiArrowRight className="shrink-0 text-brand group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted">PrepStack has no lessons for this yet. The links below are the best place to start.</p>
    )}

    {advice.resources.length > 0 && (
      <ul className="mt-3 pt-3 border-t border-ink/[0.06] space-y-1.5">
        {advice.resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-info hover:text-info break-words">
              <FiExternalLink className="shrink-0" /> {r.title} <span className="text-muted">({r.type === "video" ? "video" : "docs"})</span>
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default SkillGapCard;
