import { Link } from "react-router-dom";
import { FiArrowRight, FiTarget, FiTrash2 } from "react-icons/fi";
import { formatDate } from "../../utils/formatDate";
import { formatTitle } from "../../utils/formatTitle";

// The Reports tab of the dashboard: your role reports, newest first. The list and the delete handler come from the dashboard,
// which also needs the count and the best score for its overview strip.
const ReportsDash = ({ reports, onDelete }) => {
  if (reports.length === 0) {
    return (
      <div className="titanium-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/25 flex items-center justify-center"><FiTarget className="text-[#ffa116] text-xl" /></div>
        <h3 className="font-display text-lg font-bold text-white mb-1">Match your resume to a job</h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-5">Get a score, your skill gaps and a day-by-day plan.</p>
        <Link to="/analyzer" className="amber-specular-button inline-flex items-center gap-2 font-bold px-5 py-3 rounded-xl text-sm font-display min-h-[44px]">Create your first report</Link>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-400">Your role reports, newest first</p>
        <Link to="/analyzer" className="text-xs text-[#ffa116] hover:underline min-h-[44px] inline-flex items-center">New report</Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <li key={r._id} className="flex items-stretch rounded-xl bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.18] transition-colors">
            <Link to={`/analyzer/${r._id}`} className="flex-1 min-w-0 flex items-center gap-3 p-4">
              <span className="w-11 h-11 shrink-0 rounded-full border-4 border-[#ffa116] flex items-center justify-center font-display text-sm font-bold text-white">{r.score}</span>
              <span className="min-w-0">
                <span className="block text-sm text-zinc-100 font-semibold truncate">{formatTitle(r.title)}</span>
                <span className="block text-xs text-zinc-400">{formatDate(r.createdAt)} &middot; {r.days}-day plan</span>
              </span>
              <FiArrowRight className="ml-auto shrink-0 text-zinc-400" />
            </Link>
            <button type="button" onClick={() => onDelete(r._id)} aria-label={`Delete report ${r.title}`} className="shrink-0 w-11 flex items-center justify-center text-zinc-400 hover:text-rose-400 cursor-pointer"><FiTrash2 /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsDash;
