import { FiCheckCircle, FiMinusCircle, FiXCircle } from "react-icons/fi";

const STATUS = {
  met: { label: "Matched", Icon: FiCheckCircle, text: "text-ok", box: "bg-ok-solid/10 border-ok-solid/25" },
  partial: { label: "Partly", Icon: FiMinusCircle, text: "text-warn", box: "bg-warn-solid/10 border-warn-solid/25" },
  missing: { label: "Missing", Icon: FiXCircle, text: "text-bad", box: "bg-bad-solid/10 border-bad-solid/25" },
};

// One requirement from the job description, what the resume shows for it, and how sure we are about that proof.
const RequirementRow = ({ req }) => {
  const s = STATUS[req.status] || STATUS.missing;
  const quoted = req.status !== "missing" && req.evidence;
  return (
    <li className="rounded-xl bg-card-hover border border-ink/[0.08] p-4 text-left">
      <div className="flex items-start gap-3">
        <span className={`shrink-0 mt-0.5 ${s.text}`} aria-hidden="true"><s.Icon /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-fg-1 font-medium leading-snug break-words">{req.text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border ${s.box} ${s.text}`}>{s.label}</span>
            <span className="text-xs text-muted">{req.importance === "must" ? "Required" : "Nice to have"}</span>
            {req.downgraded && <span className="text-xs text-warn">We could not find this proof in your resume, so it counts as weaker.</span>}
          </div>
          {quoted && (
            <p className="mt-3 text-xs text-muted border-l-2 border-ink/[0.12] pl-3 leading-relaxed break-words">
              From your resume: &ldquo;{req.evidence}&rdquo;
            </p>
          )}
          {req.didYouMean && <p className="mt-2 text-xs text-muted">Did you mean {req.didYouMean}?</p>}
        </div>
      </div>
    </li>
  );
};

export default RequirementRow;
