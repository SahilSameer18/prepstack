import { useState, useEffect } from "react";
import { FiMonitor, FiSmartphone, FiTablet, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { InlineSpinner } from "../../../components/ui/Skeletons";
import { getActiveSessions, revokeSession } from "../../../api/services/authService";

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Recently";
  const diffSec = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000);
  if (diffSec < 60) return "Active just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Active ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Active ${diffDays}d ago`;
};

// ── 4. Active Devices & Sessions Manager (list logged-in devices, revoke one) ──
const SessionsCard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await getActiveSessions();
      if (res && res.data && Array.isArray(res.data.sessions)) {
        setSessions(res.data.sessions);
      }
    } catch {
      // Silently fall back
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const handleRevokeSession = async (sessionId, isCurrent) => {
    if (isCurrent) {
      if (!window.confirm("This will log you out of your current device session. Continue?")) {
        return;
      }
    }
    setRevokingSessionId(sessionId);
    try {
      const res = await revokeSession(sessionId);
      if (res.data?.isCurrentRevoked || isCurrent) {
        toast.success("Current session revoked. Signing out...");
        setUser(null);
        navigate('/login');
      } else {
        toast.success("Device session revoked successfully");
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to revoke session");
    } finally {
      setRevokingSessionId(null);
    }
  };

  return (
    <div className="titanium-card rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center text-base border border-[#ffa116]/20">
            <FiMonitor />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              Active Devices & Cryptographic Sessions
              {sessions.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                  {sessions.length} {sessions.length === 1 ? 'device' : 'devices'}
                </span>
              )}
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Real-time active tokens hashed at rest. Revoke access from stale devices.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSessions}
          disabled={loadingSessions}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
          title="Refresh active sessions"
        >
          <FiRefreshCw className={loadingSessions ? "animate-spin text-[#ffa116]" : "text-zinc-400"} />
          <span>{loadingSessions ? "Syncing..." : "Sync Sessions"}</span>
        </button>
      </div>

      <div className="pt-5 space-y-3">
        {loadingSessions ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.05]" />
                  <div className="space-y-1.5">
                    <div className="w-36 h-3.5 rounded bg-white/[0.06]" />
                    <div className="w-24 h-2.5 rounded bg-white/[0.04]" />
                  </div>
                </div>
                <div className="w-16 h-7 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-6 text-xs font-mono text-zinc-500">
            No active device records found.
          </div>
        ) : (
          sessions.map((session) => {
            const isMobile = session.os?.toLowerCase().includes("android") || session.os?.toLowerCase().includes("ios");
            const isTablet = session.os?.toLowerCase().includes("ipad");

            return (
              <div
                key={session.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                  session.isCurrent
                    ? "bg-[#ffa116]/[0.02] border-[#ffa116]/30"
                    : "bg-[#121216] border-white/[0.08] hover:border-white/[0.15]"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    session.isCurrent
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                      : "bg-white/[0.04] text-zinc-400 border border-white/[0.08]"
                  }`}>
                    {isTablet ? <FiTablet /> : isMobile ? <FiSmartphone /> : <FiMonitor />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {session.device || "Unknown Device"}
                      </p>
                      {session.isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Current Device
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                          Remote Session
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span className="text-zinc-300">IP: {session.ip}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{formatRelativeTime(session.lastActive)}</span>
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  {session.isCurrent ? (
                    <span className="text-xs font-mono text-zinc-500 px-3 py-1.5">
                      Active Browser
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.id, false)}
                      disabled={revokingSessionId === session.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 hover:border-rose-500/40 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[36px]"
                    >
                      {revokingSessionId === session.id ? (
                        <InlineSpinner size={12} color="#f87171" />
                      ) : (
                        <FiTrash2 className="text-xs" />
                      )}
                      {revokingSessionId === session.id ? "Revoking..." : "Revoke Session"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SessionsCard;
