import { FiCheckCircle, FiMinusCircle, FiXCircle } from "react-icons/fi";

const STATUS = {
  met: { label: "Matched", Icon: FiCheckCircle, text: "text-emerald-400", box: "bg-emerald-500/10 border-emerald-500/25" },
  partial: { label: "Partly", Icon: FiMinusCircle, text: "text-amber-400", box: "bg-amber-500/10 border-amber-500/25" },
  missing: { label: "Missing", Icon: FiXCircle, text: "text-rose-400", box: "bg-rose-500/10 border-rose-500/25" },
};

// One requirement from the job description, what the resume shows for it, and how sure we are about that proof.
const RequirementRow = ({ req }) => {
  const s = STATUS[req.status] || STATUS.missing;
  const quoted = req.status !== "missing" && req.evidence;
  return (
    <li className="rounded-xl bg-[#121216] border border-white/[0.08] p-4 text-left">
      <div className="flex items-start gap-3">
        <span className={`shrink-0 mt-0.5 ${s.text}`} aria-hidden="true"><s.Icon /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-100 font-medium leading-snug break-words">{req.text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border ${s.box} ${s.text}`}>{s.label}</span>
            <span className="text-xs text-zinc-400">{req.importance === "must" ? "Required" : "Nice to have"}</span>
            {req.downgraded && <span className="text-xs text-amber-400">We could not find this proof in your resume, so it counts as weaker.</span>}
          </div>
          {quoted && (
            <p className="mt-3 text-xs text-zinc-400 border-l-2 border-white/[0.12] pl-3 leading-relaxed break-words">
              From your resume: &ldquo;{req.evidence}&rdquo;
            </p>
          )}
          {req.didYouMean && <p className="mt-2 text-xs text-zinc-400">Did you mean {req.didYouMean}?</p>}
        </div>
      </div>
    </li>
  );
};

export default RequirementRow;
