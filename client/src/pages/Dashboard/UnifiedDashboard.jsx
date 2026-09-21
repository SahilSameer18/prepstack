import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiGrid,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { FiAward } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useProject } from "../../hooks/useProject";
import { getDashboardSummary } from "../../api/services/userService";
import DSADash from "./DsaDash";
import ProjectDash from "./ProjectDash";
import { PageErrorState } from "../../components/ui/ErrorComponents";

// ── UnifiedDashboard ───────────────────────────────────────────────────────
// Responsible for: fetching pre-aggregated dashboard data in 1 single query,
// rendering the page header + stats strip, then delegating to <DSADash> and <ProjectDash>.
const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { getProjects } = useProject();

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
  }, [fetchDashboard, getProjects]);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-7xl mx-auto page-enter text-white text-left">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
          <span className="tracking-wider uppercase font-semibold text-zinc-300">Developer Cockpit // Telemetry Synced</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-[-0.035em] mb-2.5">
          Welcome back, <span className="text-white">{user?.username || "Engineer"}</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Algorithmic problem tracking, curated sheet mastery, and system architecture blueprints in a single engineering cockpit.
        </p>
      </motion.div>

      {/* ── Executive Telemetry Strip ────────────────────────────────────── */}
      <section className="mb-10">
        <div className="titanium-card rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex flex-col gap-2">
                  <div className="w-20 h-3 rounded bg-white/[0.06] animate-pulse" />
                  <div className="w-16 h-8 rounded bg-white/[0.06] animate-pulse" />
                  <div className="w-24 h-2 rounded bg-white/[0.04] animate-pulse" />
                </div>
              ))
            ) : (
              [
                {
                  label: "Problems Mastered",
                  value: stats.totalSolved,
                  sub: "Across all sheets",
                  icon: <FaCheckCircle className="text-emerald-400 text-sm" />,
                  color: "text-white",
                },
                {
                  label: "Curricula In Flight",
                  value: stats.sheetsInProgress,
                  sub: "Active sheets",
                  icon: <FiActivity className="text-blue-400 text-sm" />,
                  color: "text-white",
                },
                {
                  label: "Sheets Completed",
                  value: stats.sheetsCompleted,
                  sub: "100% finished",
                  icon: <FiAward className="text-[#ffa116] text-sm" />,
                  color: "text-white",
                },
                {
                  label: "Readiness Index",
                  value: `${stats.overallPct}%`,
                  sub: "Overall curriculum coverage",
                  icon: <FiTrendingUp className="text-purple-400 text-sm" />,
                  color: "text-[#ffa116]",
                },
              ].map((stat, i) => (
                <div key={stat.label} className={`flex flex-col justify-between ${i > 0 ? "pt-4 sm:pt-0 sm:pl-6" : ""}`}>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      {stat.label}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <div className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${stat.color}`}>
                      {stat.value}
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 truncate">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Sub-sections ──────────────────────────────────────────────── */}
      {dashboardError ? (
        <PageErrorState
          message={dashboardError}
          onRetry={fetchDashboard}
          backTo="/"
          backLabel="Go Home"
        />
      ) : (
        <DSADash dsaData={dsaData} loading={loading} stats={stats} />
      )}
      <ProjectDash />
    </div>
  );
};

export default UnifiedDashboard;


