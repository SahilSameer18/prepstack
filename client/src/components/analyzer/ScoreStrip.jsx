// The evidence match: the number, and one mark per requirement from the job (matched, partly, missing).
// The number is worked out on the server from the requirement marks, never by the AI; every mark is a real requirement.
import CountUp from "../ui/CountUp";

const MARK = { met: "bg-ok-solid", partial: "bg-warn-solid", missing: "bg-bad-solid" };

const ScoreStrip = ({ score, reqs }) => {
  const count = (status) => reqs.filter((r) => r.status === status).length;
  const summary = `${count("met")} matched · ${count("partial")} partly · ${count("missing")} missing`;
  return (
    <>
      <div className="flex items-baseline gap-2" role="img" aria-label={`Evidence match ${score} out of 100`}>
        <span className="font-display text-7xl font-black leading-none tracking-tight text-fg"><CountUp value={score} duration={1.1} /></span>
        <span className="text-muted">out of 100</span>
      </div>
      <div className="min-w-0">
        {reqs.length > 0 && (
          <div className="flex gap-1.5" role="img" aria-label={summary}>
            {reqs.map((r, i) => <span key={i} className={`h-2.5 min-w-0 flex-1 rounded-full ${MARK[r.status] || MARK.missing}`} />)}
          </div>
        )}
        <p className="mt-3 text-sm text-muted">{summary}</p>
      </div>
    </>
  );
};

export default ScoreStrip;
