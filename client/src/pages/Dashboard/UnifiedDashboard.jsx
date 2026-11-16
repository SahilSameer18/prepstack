import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiActivity, FiTrendingUp } from "react-icons/fi";
import { FaCheckCircle, FaFire } from "react-icons/fa";
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
import { SectionLoader } from "../../components/ui/Skeletons";
import { useStudyPlan } from '../../hooks/useStudyPlan';
import MyPlanStudy from '../MyPlanStudy';
import FirstStepCard from "../../components/plan/FirstStepCard";

const TABS = ["plan", "dsa", "projects", "reports"];

// ── UnifiedDashboard ───────────────────────────────────────────────────────
// Each dashboard tab owns its content. The daily workspace shares the dashboard's plan state.
// The open tab lives in the address (?tab=projects), so a refresh, the back button and links all land on the right tab.
const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { getProjects, projectsTotal } = useProject();
  const planModel = useStudyPlan();
  const plan = planModel.data?.plan;
  const defaultTab = plan || planModel.data?.pausedPlans?.length ? 'plan' : 'dsa';
  const tabs = plan
    ? [['plan', 'My plan'], ['dsa', 'DSA'], ['projects', 'Projects'], ['reports', 'Reports']]
    : [['dsa', 'DSA'], ['plan', 'My plan'], ['projects', 'Projects'], ['reports', 'Reports']];
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : defaultTab;
  const openTab = (t) => setSearchParams({ tab: t }, { replace: true });

  // Keep ordinary tab keyboard behavior while the URL remains the source of truth.
  function navigateTabs(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const current = tabs.findIndex(([key]) => key === tab);
    let next = event.key === 'ArrowRight' ? (current + 1) % tabs.length : (current + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    openTab(tabs[next][0]);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
  }

  // DSA & Stats state (from single server aggregator)
  const [dsaData, setDsaData] = useState([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalQuestions: 0,
    sheetsInProgress: 0,
    sheetsCompleted: 0,
    overallPct: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [reports, setReports] = useState(null);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportsError, setReportsError] = useState(null);

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

  // The project list can fail on its own (the DSA data may still load): the Projects tab then says so and offers a retry
  const [projectsError, setProjectsError] = useState(null);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const loadProjects = useCallback(() => {
    setProjectsError(null);
    setProjectsLoaded(false);
    getProjects()
      .then(() => setProjectsLoaded(true))
      .catch((err) => setProjectsError(err.message));
  }, [getProjects]);

  const loadReports = useCallback(async () => {
    setReportsError(null);
    setReports(null);
    try {
      const result = await listReports(50);
      const data = result?.data ?? result;
      const list = data?.reports ?? [];
      setReports(list);
      setReportTotal(data?.totalCount ?? list.length);
    } catch (error) {
      setReportsError(extractError(error, "Could not load your role reports."));
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    loadProjects();
    loadReports();
  }, [fetchDashboard, loadProjects, loadReports]);

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

  // Greet by confirmed activity. Pending or failed reads leave the greeting neutral.
  const hasPlan = !!plan || !!planModel.data?.pausedPlans?.length;
  const noPlan = !planModel.loading && !planModel.error && !!planModel.data && !hasPlan;
  const dsaLoaded = !loading && !dashboardError;
  const isReturning = hasPlan || (dsaLoaded && stats.totalSolved > 0)
    || (projectsLoaded && projectsTotal > 0) || (!!reports && reportTotal > 0);
  const isNew = noPlan && dsaLoaded && projectsLoaded && !!reports && !isReturning;
  const greeting = isReturning ? "Welcome back" : isNew ? "Welcome" : "Hi";
  const counts = { dsa: dsaData.length ? `${dsaData.length} sheets` : "", projects: projectsLoaded ? projectsTotal : "", reports: reports ? reportTotal : "" };

  const dsaStats = [
    { label: "Problems solved", value: stats.totalSolved, sub: "Across all sheets", icon: <FaCheckCircle className="text-ok text-sm" />, color: "text-fg" },
    { label: "Current streak", value: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`, sub: stats.streak > 0 ? "Days in a row" : "Solve one today to start", icon: <FaFire className="text-orange text-sm" />, color: "text-fg" },
    { label: "Sheets in progress", value: stats.sheetsInProgress, sub: "Active sheets", icon: <FiActivity className="text-info text-sm" />, color: "text-fg" },
    { label: "Overall progress", value: `${stats.overallPct}%`, sub: "Of all problems", icon: <FiTrendingUp className="text-violet text-sm" />, color: "text-brand" },
  ];

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto page-enter text-fg text-left">
      <h1 className="mb-4 break-words font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        {greeting}, {user?.username || "Engineer"}
      </h1>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 border-b border-ink/[0.08] overflow-x-auto mb-6">
        {tabs.map(([key, label]) => (
          <button
            key={key} id={`dashboard-tab-${key}`} role="tab" aria-selected={tab === key}
            aria-controls="dashboard-panel" tabIndex={tab === key ? 0 : -1}
            onKeyDown={navigateTabs} onClick={() => openTab(key)}
            className={`flex-1 shrink-0 px-2 py-3 min-h-[44px] text-sm whitespace-nowrap border-b-2 cursor-pointer transition-colors sm:flex-none sm:px-4 ${tab === key ? "border-brand text-fg font-semibold" : "border-transparent text-muted hover:text-fg-2"}`}
          >
            {label} <span className="hidden text-xs text-muted font-normal sm:inline">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div id="dashboard-panel" role="tabpanel" aria-labelledby={`dashboard-tab-${tab}`}>
        {tab === 'plan' && <MyPlanStudy embedded planModel={planModel} />}
        {tab === "dsa" && (
          dashboardError ? (
            <PageErrorState message={dashboardError} onRetry={fetchDashboard} backTo="/" backLabel="Go Home" />
          ) : (
            <>
              <h2 className="mb-4 font-display text-xl font-bold text-fg">DSA progress</h2>
              {isNew && <FirstStepCard />}
              {!loading && stats.totalSolved === 0 && (
                <p data-testid="dsa-empty-hint" className="mb-6 rounded-xl border border-ink/[0.08] bg-card px-4 py-3 text-sm text-fg-3">
                  You have not solved anything yet. <Link to="/dsa" className="font-semibold text-brand">Start with a DSA sheet</Link>.
                </p>
              )}
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
        {tab === "projects" && (projectsError ? <PageErrorState title="Could not load your project ideas" message={projectsError} onRetry={loadProjects} backTo="/" backLabel="Go Home" /> : <ProjectDash />)}
        {tab === "reports" && (reportsError
          ? <PageErrorState title="Could not load your role reports" message={reportsError} onRetry={loadReports} backTo="/" backLabel="Go Home" />
          : reports ? <ReportsDash reports={reports} onDelete={removeReport} /> : <SectionLoader message="Loading your reports..." />)}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
