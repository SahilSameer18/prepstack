import { useState, useEffect } from "react";
import { CalendarBlank } from "@phosphor-icons/react";
import axiosInstance from "../../../api/axios";
import { SkeletonStat } from "../../../components/ui/Skeletons";
import { getDiceBearAvatar } from "../../../utils/avatar";

const Stat = ({ label, value, loading }) => (
  <div className="min-w-0">
    <dt className="text-sm text-muted">{label}</dt>
    <dd className="font-code text-3xl text-fg">{loading ? <SkeletonStat width="w-8" height="h-7" /> : value}</dd>
  </div>
);

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
        Your profile.
      </h1>

      <div className="mt-7 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 rounded-2xl border border-brand/40 p-1 sm:h-28 sm:w-28">
          <div className="h-full w-full overflow-hidden rounded-xl bg-canvas">
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

        <dl className="grid w-full grid-cols-2 gap-8 border-t border-ink/[0.1] pt-5 sm:w-auto sm:border-t-0 sm:pt-0">
          <Stat label="Problems solved" value={stats.solvedDSACount} loading={loadingStats} />
          <Stat label="Project ideas" value={stats.generatedProjectsCount} loading={loadingStats} />
        </dl>
      </div>
    </header>
  );
};

export default ProfileHero;
