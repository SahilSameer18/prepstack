import { CheckCircle, MinusCircle, XCircle } from "@phosphor-icons/react";

const STATUS = {
  met: { label: "Matched", Icon: CheckCircle, text: "text-ok" },
  partial: { label: "Partly", Icon: MinusCircle, text: "text-warn" },
  missing: { label: "Missing", Icon: XCircle, text: "text-bad" },
};

// One requirement from the job description, what the resume shows for it, and how sure we are about that proof.
// It is a row of a divided list; children (the "how to close this gap" help) sit right under it.
const RequirementRow = ({ req, children }) => {
  const s = STATUS[req.status] || STATUS.missing;
  const quoted = req.status !== "missing" && req.evidence;
  return (
    <li className="p-5 text-left sm:p-6">
      <div className="flex items-start gap-4">
        <s.Icon weight="duotone" aria-hidden="true" className={`mt-0.5 shrink-0 text-2xl ${s.text}`} />
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold leading-snug text-fg">{req.text}</p>
          <p className="mt-0.5 text-sm text-muted"><span className={`font-semibold ${s.text}`}>{s.label}</span> &middot; {req.importance === "must" ? "Required" : "Nice to have"}</p>
          {req.why && <p className="mt-2 text-sm leading-relaxed text-fg-3">{req.why}</p>}
          {quoted && (
            <p className="mt-3 break-words border-l-2 border-brand/40 pl-4 text-sm leading-relaxed text-fg-3">
              From your resume: &ldquo;{req.evidence}&rdquo;
            </p>
          )}
          {req.didYouMean && <p className="mt-2 text-sm text-muted">Did you mean {req.didYouMean}?</p>}
          {children}
        </div>
      </div>
    </li>
  );
};

export default RequirementRow;
