import { useState } from "react";
import { FiLogOut, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { InlineSpinner } from "../../../components/ui/Skeletons";

// ── 5. Session Termination: sign out of this device, or of every device ──
const SignOutCard = () => {
  const { handleLogout, handleLogoutAll } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      navigate('/');
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const logoutAll = async () => {
    if (!window.confirm("Are you sure you want to sign out of all active devices? You will need to log back in on all devices.")) {
      return;
    }
    setIsLoggingOutAll(true);
    try {
      await handleLogoutAll();
      toast.success("Successfully signed out of all devices");
      navigate('/login');
    } catch {
      toast.error("Failed to sign out of all devices");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
      <div>
        <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
          <FiLogOut className="text-[#ffa116]" /> Session Management
        </h3>
        <p className="text-xs font-mono text-zinc-400 mt-0.5">Safely terminate authentication cookies or invalidate all active device tokens.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <button
          onClick={logout}
          disabled={isLoggingOut || isLoggingOutAll}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors font-mono font-medium text-xs cursor-pointer flex-1 sm:flex-initial disabled:opacity-50 min-h-[44px]"
        >
          {isLoggingOut ? <InlineSpinner size={14} color="#fff" /> : <FiLogOut />}
          {isLoggingOut ? "Signing out..." : "Sign Out (This Device)"}
        </button>

        <button
          onClick={logoutAll}
          disabled={isLoggingOut || isLoggingOutAll}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-colors font-mono font-semibold text-xs cursor-pointer flex-1 sm:flex-initial disabled:opacity-50 min-h-[44px]"
        >
          {isLoggingOutAll ? <InlineSpinner size={14} color="#f87171" /> : <FiShield />}
          {isLoggingOutAll ? "Revoking all..." : "Sign Out All Devices"}
        </button>
      </div>
    </div>
  );
};

export default SignOutCard;
