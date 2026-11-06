import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiGrid, FiCode, FiCalendar } from "react-icons/fi";
import { FaEnvelope } from "react-icons/fa";
import { SkeletonStat } from "../../../components/ui/Skeletons";
import { getDiceBearAvatar } from "../../../utils/avatar";

// ── 1. Hero Identity & Progress Banner (avatar preview, handle, email, join date, quick stats) ──
const ProfileHero = ({ user, avatarUrl }) => {
  const [stats, setStats] = useState({ generatedProjectsCount: 0, solvedDSACount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Fetch User Stats ──
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/user/stats');
        const statsData = response?.data?.data?.stats || response?.data?.stats;
        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="titanium-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
      {/* Ambient Glow - Hardware Accelerated */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffa116]/[0.03] rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 pointer-events-none transform-gpu" />

      {/* Avatar Preview with Glow */}
      <div className="relative group shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ff8c00] p-0.5 shadow-xl shadow-orange-500/15 z-10">
          <div className="w-full h-full rounded-2xl bg-[#060608] flex items-center justify-center overflow-hidden">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getDiceBearAvatar(user.username);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full text-center sm:text-left z-10 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
            {user.username}
          </h1>
          {user.hasPassword && (
            <span className="self-center sm:self-auto text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Verified Identity
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-sm text-zinc-400 font-mono mb-6">
          <span className="flex items-center justify-center sm:justify-start gap-2 text-zinc-300 min-w-0 break-all">
            <FaEnvelope className="text-zinc-500 text-xs shrink-0" /> {user.email}
          </span>
          <span className="flex items-center justify-center sm:justify-start gap-2">
            <FiCalendar className="text-zinc-500 text-xs" /> Joined {joinDate}
          </span>
        </div>

        {/* Quick Stat Chips */}
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div className="bg-[#121216] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center text-sm shrink-0 border border-[#ffa116]/20">
              <FiCode />
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">DSA Mastered</div>
              <div className="text-base font-mono font-bold text-white">
                {loadingStats ? <SkeletonStat width="w-8" height="h-5" /> : stats.solvedDSACount}
              </div>
            </div>
          </div>

          <div className="bg-[#121216] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm shrink-0 border border-blue-500/20">
              <FiGrid />
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 font-semibold uppercase tracking-wider">Blueprints</div>
              <div className="text-base font-mono font-bold text-white">
                {loadingStats ? <SkeletonStat width="w-8" height="h-5" /> : stats.generatedProjectsCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
