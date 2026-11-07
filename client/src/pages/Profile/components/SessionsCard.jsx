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
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-ink/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-base border border-brand/20">
            <FiMonitor />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-fg flex items-center gap-2">
              Devices signed in to your account
              {sessions.length > 0 && (
                <span className="text-xs font-ui px-2 py-0.5 rounded-full bg-ink/[0.06] text-fg-3 border border-ink/[0.08]">
                  {sessions.length} {sessions.length === 1 ? 'device' : 'devices'}
                </span>
              )}
            </h3>
            <p className="text-xs font-ui text-muted mt-0.5">
              Sign out any device you don't use or recognise.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSessions}
          disabled={loadingSessions}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-ink/[0.04] text-xs font-ui font-medium text-fg-3 hover:text-fg hover:bg-ink/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
          title="Refresh active sessions"
        >
          <FiRefreshCw className={loadingSessions ? "animate-spin text-brand" : "text-muted"} />
          <span>{loadingSessions ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      <div className="pt-5 space-y-3">
        {loadingSessions ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-ink/[0.02] animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ink/[0.05]" />
                  <div className="space-y-1.5">
                    <div className="w-36 h-3.5 rounded bg-ink/[0.06]" />
                    <div className="w-24 h-2.5 rounded bg-ink/[0.04]" />
                  </div>
                </div>
                <div className="w-16 h-7 rounded bg-ink/[0.05]" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-6 text-xs font-ui text-muted">
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
                    ? "bg-brand/[0.02] border-brand/30"
                    : "bg-card-hover border-ink/[0.08] hover:border-ink/[0.15]"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    session.isCurrent
                      ? "bg-ok-solid/10 text-ok border border-ok-solid/25"
                      : "bg-ink/[0.04] text-muted border border-ink/[0.08]"
                  }`}>
                    {isTablet ? <FiTablet /> : isMobile ? <FiSmartphone /> : <FiMonitor />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-fg truncate">
                        {session.device || "Unknown Device"}
                      </p>
                      {session.isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-ui font-bold bg-ok-solid/15 text-ok border border-ok-solid/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                          Current Device
                        </span>
                      ) : (
                        <span className="text-xs font-ui px-2 py-0.5 rounded-full bg-ink/[0.04] text-muted border border-ink/[0.08]">
                          Other device
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-ui text-muted mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                      <span className="text-fg-3">IP: {session.ip}</span>
                      <span className="text-muted">•</span>
                      <span>{formatRelativeTime(session.lastActive)}</span>
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  {session.isCurrent ? (
                    <span className="text-xs font-ui text-muted px-3 py-1.5">
                      This browser
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.id, false)}
                      disabled={revokingSessionId === session.id}
                      className="px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-xl text-xs font-ui font-semibold bg-bad-solid/10 hover:bg-bad-solid/20 text-bad border border-bad-solid/25 hover:border-bad-solid/40 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[36px]"
                    >
                      {revokingSessionId === session.id ? (
                        <InlineSpinner size={12} color="var(--bad)" />
                      ) : (
                        <FiTrash2 className="text-xs" />
                      )}
                      {revokingSessionId === session.id ? "Signing out..." : "Sign out device"}
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
