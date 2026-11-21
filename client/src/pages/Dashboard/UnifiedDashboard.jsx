import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Flame, ListChecks, ChartLineUp } from "@phosphor-icons/react";
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
import { SectionLoader, Skeleton } from "../../components/ui/Skeletons";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useStudyPlan } from '../../hooks/useStudyPlan';
import { useLoadingGate } from '../../hooks/useLoadingGate';
import MyPlanStudy from '../MyPlanStudy';
import FirstStepCard from "../../components/plan/FirstStepCard";
import { SPRING } from "../../utils/motion";

const TABS = ["plan", "dsa", "projects", "reports"];

// ── UnifiedDashboard ───────────────────────────────────────────────────────
// Each dashboard tab owns its content. The daily workspace shares the dashboard's plan state.
// The open tab lives in the address (?tab=projects), so a refresh, the back button and links all land on the right tab.
const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { getProjects, projectsTotal } = useProject();
  const planModel = useStudyPlan();
  const calm = useReducedMotion();
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
  const gate = useLoadingGate(loading);
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
    { label: "Problems solved", value: stats.totalSolved, sub: "Across all sheets", icon: CheckCircle },
    { label: "Current streak", value: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`, sub: stats.streak > 0 ? "Days in a row" : "Solve one today to start", icon: Flame },
    { label: "Sheets in progress", value: stats.sheetsInProgress, sub: "Active sheets", icon: ListChecks },
    { label: "Overall progress", value: `${stats.overallPct}%`, sub: "Of all problems", icon: ChartLineUp },
  ];

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl px-0 pb-16 text-left text-fg sm:px-6">
        <p className="font-code text-xs uppercase tracking-[0.14em] text-muted">Dashboard</p>
        <h1 className="mb-6 mt-2 break-words font-display text-3xl font-black leading-[1.06] tracking-[-0.04em] text-fg sm:text-4xl">
          {greeting}, {user?.username || "Engineer"}
        </h1>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div role="tablist" aria-label="Dashboard sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-ink/[0.1] pb-3 sm:gap-1.5">
          {tabs.map(([key, label]) => (
            <button
              key={key} id={`dashboard-tab-${key}`} role="tab" aria-selected={tab === key}
              aria-controls="dashboard-panel" tabIndex={tab === key ? 0 : -1}
              onKeyDown={navigateTabs} onClick={() => openTab(key)}
              className={`relative flex min-h-[44px] flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-2 text-sm transition-colors sm:flex-none sm:px-4 ${tab === key ? "font-semibold text-brand" : "text-muted hover:bg-ink/[0.05] hover:text-fg"}`}
            >
              {tab === key && (
                <motion.span
                  aria-hidden="true"
                  layoutId={calm ? undefined : "dashboard-tab-slide"}
                  className="absolute inset-0 -z-10 rounded-xl bg-brand/12"
                  transition={SPRING.smooth}
                />
              )}
              {label} <span className="hidden text-sm font-normal text-muted sm:inline">{counts[key]}</span>
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
                <h2 className="sr-only">DSA progress</h2>
                {isNew && <FirstStepCard />}
                {!loading && stats.totalSolved === 0 && (
                  <p data-testid="dsa-empty-hint" className="mb-6 rounded-xl border border-ink/[0.1] bg-card px-4 py-3 text-sm text-fg-3">
                    You have not solved anything yet. <Link to="/dsa" className="font-semibold text-brand">Start with a DSA sheet</Link>.
                  </p>
                )}
                {gate === "blank" ? (
                  <div className="min-h-[40vh]" />
                ) : (
                  <>
                    <div className="surface-card grid grid-cols-2 lg:grid-cols-4">
                      {gate === "skeleton" ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} aria-hidden="true" className="space-y-3 p-6">
                            <Skeleton className="h-4 w-28 rounded-md" />
                            <Skeleton className="h-9 w-20 rounded-md" />
                            <Skeleton className="h-3 w-24 rounded-md" />
                          </div>
                        ))
                      ) : (
                        dsaStats.map((stat, i) => {
                          const Icon = stat.icon;
                          return (
                            <div key={stat.label} className={`p-6 border-ink/[0.08] ${i > 1 ? "border-t lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                              <p className="flex items-center gap-2 font-ui text-sm text-muted"><Icon weight="duotone" aria-hidden="true" className="text-lg text-brand" />{stat.label}</p>
                              <p className="mt-3 font-code text-4xl font-medium tracking-tight text-fg">{stat.value}</p>
                              <p className="mt-1 truncate text-sm text-muted">{stat.sub}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <DSADash dsaData={dsaData} loading={gate === "skeleton"} />
                  </>
                )}
              </>
            )
          )}
          {tab === "projects" && (projectsError ? <PageErrorState title="Could not load your project ideas" message={projectsError} onRetry={loadProjects} backTo="/" backLabel="Go Home" /> : <ProjectDash />)}
          {tab === "reports" && (reportsError
            ? <PageErrorState title="Could not load your role reports" message={reportsError} onRetry={loadReports} backTo="/" backLabel="Go Home" />
            : reports ? <ReportsDash reports={reports} onDelete={removeReport} /> : <SectionLoader message="Loading your reports..." />)}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
