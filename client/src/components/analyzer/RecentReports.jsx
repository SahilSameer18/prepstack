import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTarget, FiArrowRight } from "react-icons/fi";
import { listReports } from "../../api/services/analyzerService";

// The dashboard strip: your latest Role Analyzer reports. Shows nothing when there are none or the list cannot load.
const RecentReports = () => {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    listReports(3).then((r) => setReports(r?.reports || r?.data?.reports || [])).catch(() => {});
  }, []);
  if (reports.length === 0) return null;
  return (
    <section className="mt-10 text-left">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-white text-lg flex items-center gap-2"><FiTarget className="text-[#ffa116]" /> Recent role reports</h2>
        <Link to="/analyzer" className="text-xs text-zinc-400 hover:text-white min-h-[44px] inline-flex items-center">New report</Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {reports.map((r) => (
          <li key={r._id}>
            <Link to={`/analyzer/${r._id}`} className="block h-full rounded-xl bg-[#0c0c0e] border border-white/[0.08] hover:border-white/[0.18] p-4 transition-colors">
              <span className="font-display text-2xl font-extrabold text-white">{r.score}</span>
              <span className="block text-sm text-zinc-200 mt-1 truncate">{r.title}</span>
              <span className="mt-2 flex items-center justify-between text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString()} <FiArrowRight /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentReports;
