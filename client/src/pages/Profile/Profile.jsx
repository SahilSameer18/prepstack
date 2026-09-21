import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../api/axios";
import { 
  FiGrid, 
  FiCode, 
  FiLogOut, 
  FiCalendar, 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCheck, 
  FiRefreshCw, 
  FiShield,
  FiSave,
  FiCopy,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiTrash2,
  FiAlertTriangle,
  FiX
} from "react-icons/fi";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { InlineSpinner, SkeletonStat } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { updateUserProfile, changeUserPassword, deleteUserAccount } from "../../api/services/userService";
import { getActiveSessions, revokeSession } from "../../api/services/authService";
import { getDiceBearAvatar, PRESET_AVATARS } from "../../utils/avatar";

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

const Profile = () => {
  const { user, setUser, handleLogout, handleLogoutAll, handleLinkGoogle, handleSetPassword } = useAuth();
  const [stats, setStats] = useState({ generatedProjectsCount: 0, solvedDSACount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const navigate = useNavigate();

  // ── Profile Form State ──
  const [profileForm, setProfileForm] = useState({
    username: "",
    avatar: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Sync profileForm when user loads or changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        avatar: user.avatar || getDiceBearAvatar(user.username),
      });
    }
  }, [user]);

  // Is profile form dirty (modified by user)?
  const isProfileDirty = useMemo(() => {
    if (!user) return false;
    const currentAvatar = user.avatar || getDiceBearAvatar(user.username);
    return (
      profileForm.username.trim() !== user.username ||
      profileForm.avatar.trim() !== currentAvatar
    );
  }, [user, profileForm]);

  // ── Password Management State ──
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // ── Fetch User Stats ──
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/user/stats');
        if (response.data && response.data.stats) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  // ── Handlers ──
  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
    if (profileError) setProfileError(null);
  };

  const handlePresetAvatar = (seed) => {
    const newAvatar = getDiceBearAvatar(seed);
    handleProfileChange("avatar", newAvatar);
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = `bot_${Math.random().toString(36).substring(2, 8)}`;
    handleProfileChange("avatar", getDiceBearAvatar(randomSeed));
  };

  const handleCopyEmail = () => {
    if (!user?.email) return;
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!isProfileDirty || isSavingProfile) return;

    // Validate username format
    const usernameClean = profileForm.username.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(usernameClean)) {
      setProfileError("Username must start with a letter and can only contain letters, numbers, and underscores.");
      return;
    }
    if (usernameClean.length < 4 || usernameClean.length > 30) {
      setProfileError("Username must be between 4 and 30 characters.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const response = await updateUserProfile({
        username: usernameClean,
        avatar: profileForm.avatar.trim(),
      });
      if (response && response.user) {
        setUser(response.user);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      setProfileError(
        err?.response?.data?.message || err.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (user.hasPassword) {
      // Changing existing password: verify old password & new password
      if (!passwordForm.currentPassword) {
        setPasswordError("Please enter your current password.");
        return;
      }
      if (passwordForm.newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters long.");
        return;
      }
      if (passwordForm.currentPassword === passwordForm.newPassword) {
        setPasswordError("New password must be different from your current password.");
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("New passwords do not match.");
        return;
      }

      setIsSubmittingPassword(true);
      try {
        const response = await changeUserPassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
        if (response && response.user) {
          setUser(response.user);
        }
        toast.success("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordSection(false);
      } catch (err) {
        setPasswordError(
          err?.response?.data?.message || err.message || "Failed to change password. Please check your current password."
        );
      } finally {
        setIsSubmittingPassword(false);
      }
    } else {
      // Setting password for the first time (Google SSO account)
      if (passwordForm.newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }

      setIsSubmittingPassword(true);
      try {
        await handleSetPassword(passwordForm.newPassword);
        toast.success("Password set successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordSection(false);
      } catch (err) {
        setPasswordError(err.message || "Failed to set password.");
      } finally {
        setIsSubmittingPassword(false);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await handleLinkGoogle(credentialResponse.credential);
      toast.success("Google account successfully linked!");
    } catch (error) {
      toast.error(error.message || "Failed to link Google account");
    }
  };

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

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError(null);

    if (user.hasPassword) {
      if (!deleteConfirmation) {
        setDeleteError("Please enter your current password to confirm deletion.");
        return;
      }
    } else {
      if (deleteConfirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
        setDeleteError(`Please type your exact email (${user.email}) to confirm deletion.`);
        return;
      }
    }

    setIsDeletingAccount(true);
    try {
      const payload = user.hasPassword
        ? { password: deleteConfirmation }
        : { confirmationEmail: deleteConfirmation.trim() };

      await deleteUserAccount(payload);
      toast.success("Your account and all data have been permanently deleted.");
      setShowDeleteModal(false);
      setUser(null);
      navigate("/register");
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message || err.message || "Failed to delete account. Please check your credentials."
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

  const isGoogleLinked = user.providers?.some((p) => p.providerName === "google");
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const liveAvatarUrl = profileForm.avatar || user.avatar || getDiceBearAvatar(user.username);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 page-enter text-left">
      <div className="space-y-6">
        
        {/* ── 1. Hero Identity & Progress Banner ── */}
        <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden shadow-2xl">
          {/* Ambient Glow - Hardware Accelerated */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffa116]/[0.03] rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 pointer-events-none transform-gpu" />
          
          {/* Avatar Preview with Glow */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ff8c00] p-0.5 shadow-xl shadow-orange-500/15 z-10">
              <div className="w-full h-full rounded-2xl bg-[#060608] flex items-center justify-center overflow-hidden">
                <img 
                  src={liveAvatarUrl} 
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
          
          <div className="flex-1 text-center sm:text-left z-10 min-w-0">
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
              <span className="flex items-center justify-center sm:justify-start gap-2 text-zinc-300">
                <FaEnvelope className="text-zinc-500 text-xs" /> {user.email}
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

        {/* ── 2. Account Details & Developer Identicon ── */}
        <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <FiUser className="text-[#ffa116]" /> Developer Identity & Handle
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Configure your unique platform handle and cryptographic identicon.
              </p>
            </div>
          </div>

          <form onSubmit={onSaveProfile} className="space-y-6">
            <InlineErrorAlert message={profileError} onDismiss={() => setProfileError(null)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username (Unique & Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">Handle / Username</label>
                <div className="flex items-center gap-3 bg-[#121216] border border-white/[0.08] focus-within:border-[#ffa116] rounded-xl px-4 h-12 transition-colors">
                  <FiUser className="text-zinc-500 text-base shrink-0" />
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => handleProfileChange("username", e.target.value)}
                    placeholder="Unique handle"
                    className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-sm font-mono font-medium"
                    required
                    minLength={4}
                    maxLength={30}
                  />
                  {profileForm.username.trim().length >= 4 && <FiCheck className="text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[11px] font-mono text-zinc-500 pl-1">Unique handle • 4–30 alphanumeric & underscore characters</p>
              </div>

              {/* Email (Read-Only with Copy Action) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">Primary Email</label>
                <div className="flex items-center justify-between gap-3 bg-[#121216] border border-white/[0.08] rounded-xl px-4 h-12 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FiMail className="text-zinc-500 text-base shrink-0" />
                    <span className="text-zinc-300 text-sm font-mono font-medium truncate select-all">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-xs font-mono transition-colors shrink-0 cursor-pointer min-h-[36px]"
                    title="Copy Email"
                  >
                    {copiedEmail ? <FiCheck className="text-emerald-400 text-xs" /> : <FiCopy className="text-xs" />}
                    <span>{copiedEmail ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] font-mono text-zinc-500 pl-1">Primary authentication credential</p>
              </div>
            </div>

            {/* Identicon Presets */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                  Cryptographic Identicons
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#ffa116] hover:text-[#ffb84d] transition-colors font-medium cursor-pointer min-h-[44px]"
                >
                  <FiRefreshCw className="text-xs" /> Randomize Seed
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {PRESET_AVATARS.map((preset) => {
                  const avatarUrl = getDiceBearAvatar(preset.seed);
                  const isSelected = profileForm.avatar === avatarUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetAvatar(preset.seed)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors cursor-pointer min-h-[44px] ${
                        isSelected
                          ? "bg-[#ffa116]/15 border-[#ffa116] text-white"
                          : "bg-[#121216] border-white/[0.08] text-zinc-400 hover:border-white/[0.2] hover:text-white"
                      }`}
                    >
                      <img src={avatarUrl} alt={preset.label} className="w-6 h-6 rounded-lg bg-black/40" />
                      <span className="text-xs font-mono font-medium">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isProfileDirty || isSavingProfile}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-semibold text-xs sm:text-sm min-h-[44px] transition-colors ${
                  isProfileDirty
                    ? "amber-specular-button text-black font-bold cursor-pointer"
                    : "bg-white/[0.04] border border-white/[0.08] text-zinc-500 cursor-not-allowed"
                }`}
              >
                {isSavingProfile ? <InlineSpinner size={16} color="#000" /> : <FiSave />}
                {isSavingProfile ? "Saving Parameters..." : "Save Identity Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ── 3. Security & Authentication Card ── */}
        <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-white/[0.06]">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <FiShield className="text-[#ffa116]" /> Cryptographic Security & Credentials
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">Manage single sign-on OAuth linkages and password hashing.</p>
          </div>

          <div className="space-y-4">
            {/* Google Provider Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-[#121216] gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 text-lg">
                  <FaGoogle />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Google Workspace OAuth</p>
                  <p className="text-xs font-mono text-zinc-400">
                    {isGoogleLinked ? "Linked for passwordless SSO login" : "No external Google account linked"}
                  </p>
                </div>
              </div>
              
              {isGoogleLinked ? (
                <div className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 self-start sm:self-auto flex items-center gap-1.5">
                  <FiCheck /> Linked & Verified
                </div>
              ) : (
                <div className="self-start sm:self-auto">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    theme="filled_black"
                    shape="pill"
                    text="continue_with"
                  />
                </div>
              )}
            </div>

            {/* Password Row */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#121216] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 text-lg">
                    <FiLock />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Account Password</p>
                    <p className="text-xs font-mono text-zinc-400">
                      {user.hasPassword 
                        ? "Encrypted bcrypt password configured for direct login" 
                        : "No password configured (SSO-only account)"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(!showPasswordSection);
                    setPasswordError(null);
                  }}
                  className="px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-colors self-start sm:self-auto cursor-pointer min-h-[44px]"
                >
                  {showPasswordSection ? "Close Form" : user.hasPassword ? "Change Password" : "Set Password"}
                </button>
              </div>

              {/* Expandable Password Form */}
              <AnimatePresence>
                {showPasswordSection && (
                  <form
                    onSubmit={onPasswordSubmit}
                    className="pt-4 border-t border-white/[0.06] space-y-4"
                  >
                    <InlineErrorAlert message={passwordError} onDismiss={() => setPasswordError(null)} />

                    {user.hasPassword && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-zinc-300">Current Password</label>
                        <div className="relative flex items-center bg-[#0c0c0e] border border-white/[0.08] rounded-xl px-4 h-11 focus-within:border-[#ffa116]">
                          <input
                            type={showCurrentPw ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password to verify"
                            className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-sm pr-8"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            {showCurrentPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-zinc-300">
                          {user.hasPassword ? "New Password" : "Create Password"}
                        </label>
                        <div className="relative flex items-center bg-[#0c0c0e] border border-white/[0.08] rounded-xl px-4 h-11 focus-within:border-[#ffa116]">
                          <input
                            type={showNewPw ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Min 8 characters"
                            className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-sm pr-8"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            {showNewPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-zinc-300">Confirm New Password</label>
                        <div className="flex items-center bg-[#0c0c0e] border border-white/[0.08] rounded-xl px-4 h-11 focus-within:border-[#ffa116]">
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
                            required
                            minLength={8}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswordSection(false)}
                        className="px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-white/[0.05] text-zinc-400 hover:bg-white/[0.1] transition-colors cursor-pointer min-h-[44px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPassword}
                        className="px-5 py-2 text-xs font-display font-semibold rounded-xl amber-specular-button text-black transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold min-h-[44px]"
                      >
                        {isSubmittingPassword ? <InlineSpinner size={14} color="#000" /> : null}
                        {isSubmittingPassword ? "Saving..." : user.hasPassword ? "Verify & Update Password" : "Set Password"}
                      </button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── 4. Active Devices & Sessions Manager ── */}
        <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
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

        {/* ── 5. Session Termination & Danger Zone ── */}
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

        {/* ── 6. GDPR Privacy & Account Deletion ── */}
        <div className="bg-rose-500/[0.02] border border-rose-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          <div>
            <h3 className="font-display text-sm font-bold text-rose-400 flex items-center gap-2">
              <FiAlertTriangle /> Permanent Account Deletion (GDPR Right to Erasure)
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Permanently wipe your identity profile, solved DSA practice tracker, and compiled architecture blueprints. This action is irreversible.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setDeleteConfirmation("");
              setShowDeleteModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 hover:border-rose-500/40 transition-colors font-mono font-semibold text-xs cursor-pointer shrink-0 min-h-[44px]"
          >
            Delete Account...
          </button>
        </div>

        {/* ── Account Deletion Confirmation Modal ── */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div
                className="w-full max-w-md bg-[#0c0c0e] border border-rose-500/30 rounded-2xl p-6 space-y-5 shadow-2xl relative text-left"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-2.5 text-rose-400 font-display font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-base">
                      <FiAlertTriangle />
                    </div>
                    <span>Delete Account Permanently</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="text-zinc-400 hover:text-white p-1 cursor-pointer transition-colors"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>

                <div className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                  <p>This action is irreversible. The following data will be permanently wiped:</p>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1 font-mono text-[11px]">
                    <li>All solved DSA problem tracker entries across all sheets.</li>
                    <li>All compiled system architecture blueprints.</li>
                    <li>All security credentials and active device sessions.</li>
                  </ul>
                </div>

                <InlineErrorAlert message={deleteError} onDismiss={() => setDeleteError(null)} />

                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-zinc-300">
                      {user.hasPassword ? (
                        "Enter current password to verify:"
                      ) : (
                        <span>Type email <strong className="text-white select-all">{user.email}</strong> to verify:</span>
                      )}
                    </label>
                    <input
                      type={user.hasPassword ? "password" : "text"}
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder={user.hasPassword ? "Enter current password" : user.email}
                      required
                      className="w-full bg-[#121216] border border-white/[0.08] focus:border-rose-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isDeletingAccount}
                      className="px-4 py-2 text-xs font-mono font-semibold rounded-xl bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] transition-colors cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDeletingAccount}
                      className="px-5 py-2 text-xs font-display font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20 min-h-[44px]"
                    >
                      {isDeletingAccount && <InlineSpinner size={14} color="#fff" />}
                      {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
