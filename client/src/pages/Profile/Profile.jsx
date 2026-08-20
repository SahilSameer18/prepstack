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
  FiCopy
} from "react-icons/fi";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { InlineSpinner, SkeletonStat } from "../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { updateUserProfile, changeUserPassword } from "../../api/services/userService";
import { getDiceBearAvatar, PRESET_AVATARS } from "../../utils/avatar";

const Profile = () => {
  const { user, setUser, handleLogout, handleLinkGoogle, handleSetPassword } = useAuth();
  const [stats, setStats] = useState({ generatedProjectsCount: 0, solvedDSACount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  if (!user) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

  const isGoogleLinked = user.providers?.some((p) => p.providerName === "google");
  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const liveAvatarUrl = profileForm.avatar || user.avatar || getDiceBearAvatar(user.username);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        
        {/* ── 1. Hero Identity & Progress Banner ── */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#ffa116]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          {/* Avatar Preview with Glow */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ff8c00] p-1 shadow-xl shadow-orange-500/20 z-10">
              <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
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
          
          <div className="flex-1 text-center sm:text-left z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user.username}</h1>
              {user.hasPassword && (
                <span className="self-center sm:self-auto text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  Verified Account
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-400 font-medium mb-6">
              <span className="flex items-center justify-center sm:justify-start gap-2">
                <FaEnvelope className="text-gray-500 text-xs" /> {user.email}
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-2">
                <FiCalendar className="text-gray-500 text-xs" /> Joined {joinDate}
              </span>
            </div>

            {/* Quick Stat Chips */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center text-sm shrink-0">
                  <FiCode />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">DSA Solved</div>
                  <div className="text-base font-bold text-white">
                    {loadingStats ? <SkeletonStat width="w-8" height="h-5" /> : stats.solvedDSACount}
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm shrink-0">
                  <FiGrid />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">AI Projects</div>
                  <div className="text-base font-bold text-white">
                    {loadingStats ? <SkeletonStat width="w-8" height="h-5" /> : stats.generatedProjectsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Account Details & Live Avatar Picker ── */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiUser className="text-[#ffa116]" /> Personal Details
              </h2>
              <p className="text-xs text-gray-400 mt-1">Customize your unique username and choose your robot avatar.</p>
            </div>
          </div>

          <form onSubmit={onSaveProfile} className="space-y-6">
            <InlineErrorAlert message={profileError} onDismiss={() => setProfileError(null)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username (Unique & Editable) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Username</label>
                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/[0.08] focus-within:border-[#ffa116] focus-within:shadow-[0_0_0_3px_rgba(255,161,22,0.1)] rounded-xl px-4 h-12 transition-all">
                  <FiUser className="text-gray-500 text-base shrink-0" />
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => handleProfileChange("username", e.target.value)}
                    placeholder="Unique username"
                    className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm font-medium"
                    required
                    minLength={4}
                    maxLength={30}
                  />
                  {profileForm.username.trim().length >= 4 && <FiCheck className="text-green-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-gray-600 pl-1">Unique handle • 4–30 alphanumeric & underscore characters</p>
              </div>

              {/* Email (Read-Only with Copy Action) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
                <div className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 h-12 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FiMail className="text-gray-500 text-base shrink-0" />
                    <span className="text-gray-300 text-sm font-medium truncate select-all">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-gray-300 hover:text-white text-xs font-medium transition-all shrink-0 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? <FiCheck className="text-green-400 text-xs" /> : <FiCopy className="text-xs" />}
                    <span>{copiedEmail ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 pl-1">Permanently linked to your account</p>
              </div>
            </div>

            {/* Avatar Customization */}
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Robot Avatar Presets
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="flex items-center gap-1.5 text-xs text-[#ffa116] hover:text-[#ffb84d] transition-colors font-medium cursor-pointer"
                >
                  <FiRefreshCw className="text-xs" /> Randomize
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {PRESET_AVATARS.map((preset) => {
                  const avatarUrl = getDiceBearAvatar(preset.seed);
                  const isSelected = profileForm.avatar === avatarUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetAvatar(preset.seed)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#ffa116]/15 border-[#ffa116] text-white shadow-[0_0_12px_rgba(255,161,22,0.2)]"
                          : "bg-[#0a0a0a] border-white/[0.08] text-gray-400 hover:border-white/[0.2] hover:text-white"
                      }`}
                    >
                      <img src={avatarUrl} alt={preset.label} className="w-6 h-6 rounded-lg bg-black/40" />
                      <span className="text-xs font-medium">{preset.label}</span>
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
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isProfileDirty
                    ? "bg-gradient-to-r from-[#ffa116] to-[#ff8c00] text-black shadow-lg shadow-orange-500/25 hover:brightness-110 cursor-pointer"
                    : "bg-white/[0.04] border border-white/[0.08] text-gray-500 cursor-not-allowed opacity-60"
                }`}
              >
                {isSavingProfile ? <InlineSpinner size={16} color="#000" /> : <FiSave />}
                {isSavingProfile ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ── 3. Security & Authentication Card ── */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiShield className="text-[#ffa116]" /> Security & Authentication
            </h2>
            <p className="text-xs text-gray-400 mt-1">Manage connected login methods and password verification.</p>
          </div>

          <div className="space-y-4">
            {/* Google Provider Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#0a0a0a] gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-300 text-lg">
                  <FaGoogle />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Google Sign-In</p>
                  <p className="text-xs text-gray-500">
                    {isGoogleLinked ? "Linked for one-click OAuth login" : "Not connected to a Google account"}
                  </p>
                </div>
              </div>
              
              {isGoogleLinked ? (
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 self-start sm:self-auto flex items-center gap-1.5">
                  <FiCheck /> Connected
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
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0a0a0a] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-300 text-lg">
                    <FiLock />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Account Password</p>
                    <p className="text-xs text-gray-500">
                      {user.hasPassword 
                        ? "Secure password is set for email login" 
                        : "No password configured (managed with Google Sign-In)"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(!showPasswordSection);
                    setPasswordError(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.12] transition-all self-start sm:self-auto cursor-pointer"
                >
                  {showPasswordSection ? "Hide Form" : user.hasPassword ? "Change Password" : "Set Password"}
                </button>
              </div>

              {/* Expandable Password Form */}
              <AnimatePresence>
                {showPasswordSection && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={onPasswordSubmit}
                    className="pt-4 border-t border-white/[0.06] space-y-4 overflow-hidden"
                  >
                    <InlineErrorAlert message={passwordError} onDismiss={() => setPasswordError(null)} />

                    {user.hasPassword && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-300">Current Password</label>
                        <div className="relative flex items-center bg-black/50 border border-white/[0.1] rounded-xl px-4 h-11 focus-within:border-[#ffa116]">
                          <input
                            type={showCurrentPw ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password to verify"
                            className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm pr-8"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 text-gray-400 hover:text-white cursor-pointer"
                          >
                            {showCurrentPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-300">
                          {user.hasPassword ? "New Password" : "Create Password"}
                        </label>
                        <div className="relative flex items-center bg-black/50 border border-white/[0.1] rounded-xl px-4 h-11 focus-within:border-[#ffa116]">
                          <input
                            type={showNewPw ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Min 8 characters"
                            className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm pr-8"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 text-gray-400 hover:text-white cursor-pointer"
                          >
                            {showNewPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-300">Confirm New Password</label>
                        <div className="flex items-center bg-black/50 border border-white/[0.1] rounded-xl px-4 h-11 focus-within:border-[#ffa116]">
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm"
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
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.05] text-gray-400 hover:bg-white/[0.1] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingPassword}
                        className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#ffa116] text-black hover:bg-[#ffb84d] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        {isSubmittingPassword ? <InlineSpinner size={14} color="#000" /> : null}
                        {isSubmittingPassword ? "Saving..." : user.hasPassword ? "Verify & Update Password" : "Set Password"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── 4. Danger Zone / Logout ── */}
        <div className="bg-[#111] border border-red-500/15 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <FiLogOut /> Session Management
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Safely terminate your active session on this device.</p>
          </div>

          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all font-semibold text-xs shrink-0 cursor-pointer"
          >
            {isLoggingOut ? <InlineSpinner size={14} color="#f87171" /> : <FiLogOut />}
            {isLoggingOut ? "Signing out..." : "Sign Out of PrepStack"}
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default Profile;
