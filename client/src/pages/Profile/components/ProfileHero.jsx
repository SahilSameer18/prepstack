import { useState, useEffect } from "react";
import { CalendarBlank, CodeBlock, Lightbulb } from "@phosphor-icons/react";
import axiosInstance from "../../../api/axios";
import { SkeletonStat } from "../../../components/ui/Skeletons";
import { getDiceBearAvatar } from "../../../utils/avatar";

const Stat = ({ icon, label, value, loading }) => {
  const Icon = icon;
  return (
  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-ink/[0.1] bg-card px-4 py-3">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-xl text-brand">
      <Icon weight="duotone" aria-hidden="true" />
    </span>
    <div>
      <div className="font-ui text-xs font-medium leading-tight text-fg-3">{label}</div>
      <div className="font-ui text-lg font-bold text-fg">{loading ? <SkeletonStat width="w-8" height="h-5" /> : value}</div>
    </div>
  </div>
  );
};

// The page header: who you are (live avatar preview, name, email, join date) and your two headline numbers.
const ProfileHero = ({ user, avatarUrl }) => {
  const [stats, setStats] = useState({ generatedProjectsCount: 0, solvedDSACount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/api/user/stats");
        const statsData = response?.data?.data?.stats || response?.data?.stats;
        if (statsData) setStats(statsData);
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
    <header className="pt-2">
      <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
        Your <span className="text-brand">profile.</span>
      </h1>

      <div className="mt-7 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 rounded-2xl p-0.5 sm:h-28 sm:w-28" style={{ background: "var(--brand-grad-bottom)" }}>
          <div className="h-full w-full overflow-hidden rounded-[0.9rem] bg-canvas">
            <img
              src={avatarUrl}
              alt={user.username}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getDiceBearAvatar(user.username);
              }}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="truncate font-display text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">{user.username}</p>
          <p className="mt-1 flex flex-col gap-x-5 gap-y-1 font-ui text-sm text-muted sm:flex-row sm:flex-wrap">
            <span className="min-w-0 break-all">{user.email}</span>
            <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
              <CalendarBlank aria-hidden="true" /> Joined {joinDate}
            </span>
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <Stat icon={CodeBlock} label="Problems solved" value={stats.solvedDSACount} loading={loadingStats} />
          <Stat icon={Lightbulb} label="Project ideas" value={stats.generatedProjectsCount} loading={loadingStats} />
        </div>
      </div>
    </header>
  );
};

export default ProfileHero;
