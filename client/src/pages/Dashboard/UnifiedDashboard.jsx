import React, { useEffect, useState, useMemo } from "react";
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
import {
  dsaSheet,
  getSheetProgress,
  getSheetBySlug,
} from "../../api/services/sheetService";
import DSADash from "./DsaDash";
import ProjectDash from "./ProjectDash";

// ── UnifiedDashboard ───────────────────────────────────────────────────────
// Responsible for: fetching data, computing stats, rendering the page header
// + stats strip, then delegating to <DSADash> and <ProjectDash>.
const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { getProjects } = useProject();

  // DSA state
  const [dsaData, setDsaData] = useState([]);
  const [dsaLoading, setDsaLoading] = useState(true);

  // ── Fetch DSA progress on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchDSA = async () => {
      setDsaLoading(true);
      try {
        const sheetsRes = await dsaSheet();
        const sheets = sheetsRes?.data || [];

        const progressResults = await Promise.allSettled(
          sheets.map((s) =>
            getSheetProgress(s.slug).catch(() => ({
              data: { solvedProblems: [] },
            })),
          ),
        );

        const detailResults = await Promise.allSettled(
          sheets.map((s) => getSheetBySlug(s.slug).catch(() => null)),
        );

        const combined = sheets.map((sheet, i) => {
          const progressData =
            progressResults[i].status === "fulfilled"
              ? progressResults[i].value?.data
              : null;
          const solved = progressData?.solvedProblems?.length || 0;

          const detail =
            detailResults[i].status === "fulfilled"
              ? detailResults[i].value?.data
              : null;
          let total = 0;
          if (detail?.topics) {
            const linkSet = new Set();
            detail.topics.forEach((t) => {
              (t.problems || t.questions || []).forEach((p) => {
                if (p.link) linkSet.add(p.link);
              });
            });
            total = linkSet.size;
          }

          return { sheet, solved, total };
        });

        setDsaData(combined);
      } catch (err) {
        console.error("Failed to load DSA data", err);
      } finally {
        setDsaLoading(false);
      }
    };

    fetchDSA();
    getProjects();
  }, []);

  // ── Computed aggregate stats (passed to DSADash + stats strip) ──────────
  const stats = useMemo(() => {
    const totalSolved = dsaData.reduce((acc, d) => acc + d.solved, 0);
    const totalQuestions = dsaData.reduce((acc, d) => acc + d.total, 0);
    const sheetsInProgress = dsaData.filter(
      (d) => d.solved > 0 && d.solved < d.total,
    ).length;
    const sheetsCompleted = dsaData.filter(
      (d) => d.solved > 0 && d.solved === d.total,
    ).length;
    const overallPct =
      totalQuestions === 0
        ? 0
        : Math.round((totalSolved / totalQuestions) * 100);

    return {
      totalSolved,
      totalQuestions,
      sheetsInProgress,
      sheetsCompleted,
      overallPct,
    };
  }, [dsaData]);

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto page-enter text-white">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="flex items-center gap-2 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          <FiGrid className="text-[#ffa116] text-lg" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#ffa116]">
            {user?.username || "Coder"}'s Dashboard
          </span>
        </motion.div>
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
      {!dsaLoading && (
        <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.07,
              }}
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
          ))}
        </section>
      )}

      {/* ── Sub-sections ──────────────────────────────────────────────── */}
      <DSADash dsaData={dsaData} loading={dsaLoading} stats={stats} />
      <ProjectDash />
    </div>
  );
};

export default UnifiedDashboard;