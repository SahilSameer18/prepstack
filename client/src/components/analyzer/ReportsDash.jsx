import { Link } from "react-router-dom";
import { ArrowRight, Target, Trash } from "@phosphor-icons/react";
import { formatDate } from "../../utils/formatDate";
import { formatTitle } from "../../utils/formatTitle";
import { EmptyState } from "../ui/StateComponents";

// The Reports tab lists saved reports from newest to oldest.
const ReportsDash = ({ reports, onDelete }) => {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Match your resume to a job"
        text="Get a score, your skill gaps and a day-by-day plan."
        action={{ label: "Create your first report", to: "/analyzer" }}
      />
    );
  }
  return (
    <div className="text-left">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-fg">Role reports</h2>
        <Link to="/analyzer" className="group inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">
          New report <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
        </Link>
      </div>
      <ul className="surface-card divide-y divide-ink/[0.08]">
        {reports.map((r) => (
          <li key={r._id} className="flex items-stretch transition-colors hover:bg-ink/[0.02]">
            <Link to={`/analyzer/${r._id}`} className="group flex min-w-0 flex-1 items-center gap-5 p-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-brand font-display text-lg font-extrabold text-fg">{r.score}</span>
              <span className="min-w-0 flex-1">
                <span className="block break-words font-display text-lg font-extrabold tracking-tight text-fg">{formatTitle(r.title)}</span>
                <span className="block text-sm text-muted">{formatDate(r.createdAt)} &middot; {r.days}-day plan</span>
              </span>
              <ArrowRight aria-hidden="true" className="shrink-0 text-lg text-muted transition-transform duration-150 group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={() => onDelete(r._id)}
              aria-label={`Delete report ${r.title}`}
              className="flex w-14 shrink-0 cursor-pointer items-center justify-center text-xl text-muted transition-colors hover:text-bad"
            >
              <Trash aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsDash;
