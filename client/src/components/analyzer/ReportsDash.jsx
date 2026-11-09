import { Link } from "react-router-dom";
import { FiArrowRight, FiTarget, FiTrash2 } from "react-icons/fi";
import { formatDate } from "../../utils/formatDate";
import { formatTitle } from "../../utils/formatTitle";
import { EmptyState } from "../ui/StateComponents";

// The Reports tab of the dashboard: your role reports, newest first. The list and the delete handler come from the dashboard,
// which also needs the count and the best score for its overview strip.
const ReportsDash = ({ reports, onDelete }) => {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FiTarget}
        title="Match your resume to a job"
        text="Get a score, your skill gaps and a day-by-day plan."
        action={{ label: "Create your first report", to: "/analyzer" }}
      />
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted">Your role reports, newest first</p>
        <Link to="/analyzer" className="text-xs text-brand hover:underline min-h-[44px] inline-flex items-center">New report</Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <li key={r._id} className="flex items-stretch rounded-xl bg-card border border-ink/[0.08] hover:border-ink/[0.18] transition-colors">
            <Link to={`/analyzer/${r._id}`} className="flex-1 min-w-0 flex items-center gap-3 p-4">
              <span className="w-11 h-11 shrink-0 rounded-full border-4 border-brand flex items-center justify-center font-display text-sm font-bold text-fg">{r.score}</span>
              <span className="min-w-0">
                <span className="block text-sm text-fg-1 font-semibold truncate">{formatTitle(r.title)}</span>
                <span className="block text-xs text-muted">{formatDate(r.createdAt)} &middot; {r.days}-day plan</span>
              </span>
              <FiArrowRight className="ml-auto shrink-0 text-muted" />
            </Link>
            <button type="button" onClick={() => onDelete(r._id)} aria-label={`Delete report ${r.title}`} className="shrink-0 w-11 flex items-center justify-center text-muted hover:text-bad cursor-pointer"><FiTrash2 /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsDash;
