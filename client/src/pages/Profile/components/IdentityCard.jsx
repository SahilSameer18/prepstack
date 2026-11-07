import { useState, useMemo } from "react";
import { FiUser, FiMail, FiCheck, FiRefreshCw, FiSave, FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { InlineSpinner } from "../../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../../components/ui/ErrorComponents";
import { updateUserProfile } from "../../../api/services/userService";
import { getDiceBearAvatar, PRESET_AVATARS } from "../../../utils/avatar";

// ── 2. Account Details & Developer Identicon (username + avatar form). The form values live in the page so the
//      hero banner can preview the avatar live while the user edits. ──
const IdentityCard = ({ profileForm, setProfileForm }) => {
  const { user, setUser } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Is profile form dirty (modified by user)?
  const isProfileDirty = useMemo(() => {
    if (!user) return false;
    const currentAvatar = user.avatar || getDiceBearAvatar(user.username);
    return (
      profileForm.username.trim() !== user.username ||
      profileForm.avatar.trim() !== currentAvatar
    );
  }, [user, profileForm]);

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
      const updatedUser = response?.data?.user || response?.user;
      if (updatedUser) {
        setUser(updatedUser);
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

  return (
    <div className="titanium-card rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <FiUser className="text-[#ffa116]" /> Your profile
          </h2>
          <p className="text-xs font-ui text-zinc-400 mt-1">
            Choose your username and avatar.
          </p>
        </div>
      </div>

      <form onSubmit={onSaveProfile} className="space-y-6">
        <InlineErrorAlert message={profileError} onDismiss={() => setProfileError(null)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Username (Unique & Editable) */}
          <div className="space-y-1.5">
            <label className="text-xs font-ui font-semibold text-zinc-400">Username</label>
            <div className="flex items-center gap-3 bg-[#121216] border border-white/[0.08] focus-within:border-[#ffa116] rounded-xl px-4 h-12 transition-colors">
              <FiUser className="text-zinc-400 text-base shrink-0" />
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => handleProfileChange("username", e.target.value)}
                placeholder="Username"
                className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-sm font-ui font-medium"
                required
                minLength={4}
                maxLength={30}
              />
              {profileForm.username.trim().length >= 4 && <FiCheck className="text-emerald-400 shrink-0" />}
            </div>
            <p className="text-xs font-ui text-zinc-400 pl-1">4–30 letters, numbers or underscores</p>
          </div>

          {/* Email (Read-Only with Copy Action) */}
          <div className="space-y-1.5">
            <label className="text-xs font-ui font-semibold text-zinc-400">Primary Email</label>
            <div className="flex items-center justify-between gap-3 bg-[#121216] rounded-xl px-4 h-12 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <FiMail className="text-zinc-400 text-base shrink-0" />
                <span className="text-zinc-300 text-sm font-ui font-medium truncate select-all">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-xs font-ui transition-colors shrink-0 cursor-pointer min-h-[36px]"
                title="Copy Email"
              >
                {copiedEmail ? <FiCheck className="text-emerald-400 text-xs" /> : <FiCopy className="text-xs" />}
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs font-ui text-zinc-400 pl-1">The email you sign in with</p>
          </div>
        </div>

        {/* Identicon Presets */}
        <div className="pt-4 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-ui font-semibold text-zinc-400">
              Choose your avatar
            </label>
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="flex items-center gap-1.5 text-xs font-ui text-[#ffa116] hover:text-[#ffb84d] transition-colors font-medium cursor-pointer min-h-[44px]"
            >
              <FiRefreshCw className="text-xs" /> Shuffle
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
                  <span className="text-xs font-ui font-medium">{preset.label}</span>
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
                : "bg-white/[0.04] border border-white/[0.08] text-zinc-400 cursor-not-allowed"
            }`}
          >
            {isSavingProfile ? <InlineSpinner size={16} color="#000" /> : <FiSave />}
            {isSavingProfile ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdentityCard;
