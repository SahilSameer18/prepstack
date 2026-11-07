import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiActivity, FiTrendingUp } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { FiAward } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useProject } from "../../hooks/useProject";
import { getDashboardSummary } from "../../api/services/userService";
import { listReports, deleteReport } from "../../api/services/analyzerService";
import { extractError } from "../../utils/extractError";
import DSADash from "./DsaDash";
import ProjectDash from "./ProjectDash";
import ReportsDash from "../../components/analyzer/ReportsDash";
import { PageErrorState } from "../../components/ui/ErrorComponents";

const TABS = ["dsa", "projects", "reports"];

// ── UnifiedDashboard ───────────────────────────────────────────────────────
// One overview strip (a number per area, each one opens its tab) and three tabs, so only one area shows at a time.
// The open tab lives in the address (?tab=projects), so a refresh, the back button and links all land on the right tab.
const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { getProjects, projects } = useProject();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "dsa";
  const openTab = (t) => setSearchParams(t === "dsa" ? {} : { tab: t }, { replace: true });

  // DSA & Stats state (from single server aggregator)
  const [dsaData, setDsaData] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalQuestions: 0,
    sheetsInProgress: 0,
    sheetsCompleted: 0,
    overallPct: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [reports, setReports] = useState(null); // null while loading, then the list (the list is optional: a failure shows as 0)
  const [reportTotal, setReportTotal] = useState(0);

  // ── Fetch all dashboard data in 1 single optimized server call ───────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setDashboardError(null);
    try {
      const res = await getDashboardSummary();
      if (res?.data) {
        setDsaData(res.data.dsaSheets || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
      setDashboardError(
        err?.response?.data?.message ||
        "Failed to load DSA progress. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    getProjects();
    listReports(50)
      .then((r) => { setReports(r?.reports || r?.data?.reports || []); setReportTotal(r?.totalCount ?? r?.data?.totalCount ?? 0); })
      .catch(() => setReports([]));
  }, [fetchDashboard, getProjects]);

  const removeReport = async (id) => {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    try {
      await deleteReport(id);
      setReports((list) => list.filter((r) => r._id !== id));
      setReportTotal((n) => Math.max(0, n - 1));
    } catch (err) {
      toast.error(extractError(err, "Could not delete the report."));
    }
  };

  const best = reports?.length ? Math.max(...reports.map((r) => r.score)) : null;
  const overview = [
    { key: "dsa", label: "DSA solved", value: loading ? "-" : stats.totalSolved, sub: loading ? "" : `of ${stats.totalQuestions}` },
    { key: "projects", label: "Project ideas", value: projects ? projects.length : "-", sub: "" },
    { key: "reports", label: "Role reports", value: reports ? reportTotal : "-", sub: best !== null ? `best ${best}` : "" },
  ];
  const counts = { dsa: dsaData.length ? `${dsaData.length} sheets` : "", projects: projects?.length ?? "", reports: reports ? reportTotal : "" };

  const dsaStats = [
    { label: "Problems solved", value: stats.totalSolved, sub: "Across all sheets", icon: <FaCheckCircle className="text-ok text-sm" />, color: "text-fg" },
    { label: "Sheets in progress", value: stats.sheetsInProgress, sub: "Active sheets", icon: <FiActivity className="text-info text-sm" />, color: "text-fg" },
    { label: "Sheets Completed", value: stats.sheetsCompleted, sub: "100% finished", icon: <FiAward className="text-brand text-sm" />, color: "text-fg" },
    { label: "Overall progress", value: `${stats.overallPct}%`, sub: "Of all problems", icon: <FiTrendingUp className="text-violet text-sm" />, color: "text-brand" },
  ];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto page-enter text-fg text-left">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <div className="inline-flex items-center gap-2 text-xs font-ui text-muted mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="tracking-wider font-semibold text-fg-3">Your dashboard</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg tracking-[-0.035em] mb-2.5">
          Welcome back, <span className="text-fg">{user?.username || "Engineer"}</span>
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-2xl leading-relaxed">
          Your DSA progress, project ideas and role reports in one place.
        </p>
      </motion.div>

      {/* ── Overview: one number per area, each opens its tab ─────────────── */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3 mb-6" aria-label="Overview">
        {overview.map((o) => (
          <button
            key={o.key} type="button" onClick={() => openTab(o.key)}
            className={`text-left rounded-xl border p-3 sm:p-4 min-h-[44px] cursor-pointer transition-colors ${tab === o.key ? "border-brand/60 bg-brand/[0.04]" : "border-ink/[0.08] bg-card hover:border-ink/[0.18]"}`}
          >
            <span className="block text-xs text-muted">{o.label}</span>
            <span className="block font-display text-2xl sm:text-3xl font-extrabold text-fg mt-1">{o.value} {o.sub && <span className="text-xs sm:text-sm font-normal text-muted">{o.sub}</span>}</span>
          </button>
        ))}
      </section>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 border-b border-ink/[0.08] overflow-x-auto mb-6">
        {[["dsa", "DSA"], ["projects", "Projects"], ["reports", "Reports"]].map(([key, label]) => (
          <button
            key={key} role="tab" aria-selected={tab === key} onClick={() => openTab(key)}
            className={`px-3 sm:px-4 py-3 min-h-[44px] text-sm whitespace-nowrap border-b-2 cursor-pointer transition-colors ${tab === key ? "border-brand text-fg font-semibold" : "border-transparent text-muted hover:text-fg-2"}`}
          >
            {label} <span className="text-xs text-muted font-normal">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "dsa" && (
          dashboardError ? (
            <PageErrorState message={dashboardError} onRetry={fetchDashboard} backTo="/" backLabel="Go Home" />
          ) : (
            <>
              <section className="mb-10">
                <div className="titanium-card rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-ink/[0.08]">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 flex flex-col gap-2">
                          <div className="w-20 h-3 rounded bg-ink/[0.06] animate-pulse" />
                          <div className="w-16 h-8 rounded bg-ink/[0.06] animate-pulse" />
                          <div className="w-24 h-2 rounded bg-ink/[0.04] animate-pulse" />
                        </div>
                      ))
                    ) : (
                      dsaStats.map((stat, i) => (
                        <div key={stat.label} className={`flex flex-col justify-between group p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-ink/[0.02] ${i > 0 ? "pt-4 sm:pt-0 sm:pl-6" : ""}`}>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-ui text-muted group-hover:text-fg-2 transition-colors font-semibold">{stat.label}</span>
                            <div className="w-7 h-7 rounded-lg bg-ink/[0.03] border border-ink/[0.08] flex items-center justify-center group-hover:border-ink/[0.2] transition-colors">{stat.icon}</div>
                          </div>
                          <div>
                            <div className={`font-ui text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${stat.color}`}>{stat.value}</div>
                            <p className="text-xs font-ui text-muted transition-colors truncate">{stat.sub}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
              <DSADash dsaData={dsaData} loading={loading} stats={stats} />
            </>
          )
        )}
        {tab === "projects" && <ProjectDash />}
        {tab === "reports" && (reports ? <ReportsDash reports={reports} onDelete={removeReport} /> : <p className="text-sm text-muted">Loading your reports...</p>)}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
