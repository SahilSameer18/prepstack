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
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto page-enter text-white">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FiGrid className="text-[#ffa116] text-lg" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#ffa116]">
            {user?.username || "Coder"}'s Dashboard
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
          Welcome back,{" "}
          <span className="text-[#ffa116]">{user?.username || "Coder"}</span>
        </h1>
        <p className="text-gray-500 text-sm">
          Track your DSA progress and manage your saved project ideas — all in
          one place.
        </p>
      </motion.div>

      {/* ── Key Stats Strip ────────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-white/[0.06] rounded-2xl bg-[#111] px-4 py-5 flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="w-6 h-6 rounded-md skeleton-shine" />
              <div className="w-16 h-8 rounded-lg skeleton-shine" />
              <div className="w-24 h-3 rounded skeleton-shine" />
            </div>
          ))
        ) : (
          [
            {
              label: "Problems Solved",
              value: stats.totalSolved,
              icon: <FaCheckCircle className="text-emerald-400" />,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              label: "Sheets In Progress",
              value: stats.sheetsInProgress,
              icon: <FiActivity className="text-blue-400" />,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              label: "Sheets Completed",
              value: stats.sheetsCompleted,
              icon: <FiAward className="text-[#ffa116]" />,
              color: "text-[#ffa116]",
              bg: "bg-[#ffa116]/10 border-[#ffa116]/20",
            },
            {
              label: "Overall Progress",
              value: `${stats.overallPct}%`,
              icon: <FiTrendingUp className="text-purple-400" />,
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`border rounded-2xl ${stat.bg} px-4 py-5 flex flex-col items-center justify-center gap-2 text-center backdrop-blur-sm hover:border-opacity-60 transition-all`}
            >
              <span className="text-xl">{stat.icon}</span>
              <span className={`text-2xl md:text-3xl font-black ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold whitespace-nowrap">
                {stat.label}
              </span>
            </motion.div>
          ))
        )}
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


