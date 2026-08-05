import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../api/axios";
import { FiGrid, FiCode, FiLogOut, FiCalendar } from "react-icons/fi";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { InlineSpinner, SkeletonStat } from "../../components/ui/Skeletons";

const Profile = () => {
  const { user, handleLogout, handleLinkGoogle, handleSetPassword } = useAuth();
  const [stats, setStats] = useState({ generatedProjectsCount: 0, solvedDSACount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/user/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      navigate('/');
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await handleLinkGoogle(credentialResponse.credential);
      toast.success("Google account successfully linked!");
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Failed to link Google account");
    }
  };

  const onSetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }
    setIsSettingPassword(true);
    try {
      await handleSetPassword(newPassword);
      toast.success("Password set successfully!");
      setShowPasswordForm(false);
      setNewPassword("");
    } catch (error) {
      toast.error(error.message || "Failed to set password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

  const isGoogleLinked = user.providers?.some(p => p.providerName === 'google');
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="space-y-6">
        
        {/* Header / Identity Card */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffa116]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#ffa116] to-[#ff8c00] p-1 flex-shrink-0 shadow-xl shadow-orange-500/20 z-10">
            <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`;
                  }}
                />
              ) : (
                <span className="text-5xl font-bold text-[#ffa116]">{user.username[0].toUpperCase()}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left z-10">
            <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-gray-400 font-medium">
              <span className="flex items-center justify-center sm:justify-start gap-2">
                <FaEnvelope className="text-gray-500" /> {user.email}
              </span>
              <span className="flex items-center justify-center sm:justify-start gap-2">
                <FiCalendar className="text-gray-500" /> Joined {joinDate}
              </span>
            </div>
            
            <div className="mt-6 flex justify-center sm:justify-start">
              <button 
                onClick={logout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all font-medium text-sm"
              >
                {isLoggingOut ? <InlineSpinner size={16} color="#f87171" /> : <FiLogOut />}
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 flex items-center gap-5 hover:border-white/[0.15] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#ffa116]/10 text-[#ffa116] flex items-center justify-center text-xl shrink-0">
              <FiCode />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">DSA Problems Solved</p>
              <h3 className="text-2xl font-bold text-white">
                {loadingStats ? <SkeletonStat width="w-10" height="h-7" /> : stats.solvedDSACount}
              </h3>
            </div>
          </div>
          
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 flex items-center gap-5 hover:border-white/[0.15] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl shrink-0">
              <FiGrid />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">AI Projects Generated</p>
              <h3 className="text-2xl font-bold text-white">
                {loadingStats ? <SkeletonStat width="w-10" height="h-7" /> : stats.generatedProjectsCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Account Linking / Security */}
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white mb-6">Account Security & Linking</h2>
          
          <div className="space-y-4">
            {/* Email Provider */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-[#0a0a0a] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-300">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Email & Password</p>
                  <p className="text-xs text-gray-500">
                    {user.hasPassword ? "Password is set" : "No password set"}
                  </p>
                </div>
              </div>
              
              {user.hasPassword ? (
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 self-start sm:self-auto">
                  Active
                </div>
              ) : (
                <div className="self-start sm:self-auto w-full sm:w-auto">
                  {!showPasswordForm ? (
                    <button 
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20 hover:bg-[#ffa116]/20 transition-all w-full sm:w-auto"
                    >
                      Set Password
                    </button>
                  ) : (
                    <form onSubmit={onSetPasswordSubmit} className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 8)" 
                        className="bg-black/50 border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#ffa116]/50"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          disabled={isSettingPassword}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#ffa116] text-black hover:bg-[#ffb84d] transition-all disabled:opacity-50 flex-1 sm:flex-none"
                        >
                          {isSettingPassword ? "Saving..." : "Save"}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowPasswordForm(false)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.05] text-gray-400 hover:bg-white/[0.1] transition-all flex-1 sm:flex-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Google Provider */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-[#0a0a0a] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-300">
                  <FaGoogle />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Google Account</p>
                  <p className="text-xs text-gray-500">
                    {isGoogleLinked ? "Linked for quick sign-in" : "Not linked"}
                  </p>
                </div>
              </div>
              
              {isGoogleLinked ? (
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 self-start sm:self-auto">
                  Linked
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
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Profile;

