import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowsClockwise, Check, Copy, Envelope, FloppyDisk, User } from "@phosphor-icons/react";
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
  const [justSaved, setJustSaved] = useState(false);
  const calm = useReducedMotion();
  // the icon pops in when the state changes (not on first paint)
  const pop = (key, show) => ({ key, initial: show && !calm ? { scale: 0.5, opacity: 0 } : false, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', duration: 0.25, bounce: 0.3 }, className: 'flex' });

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
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1800);
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
    <div className="surface-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink/[0.06]">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-fg">Account</h2>
          <p className="text-sm font-ui text-muted mt-1">
            Choose your username and avatar.
          </p>
        </div>
      </div>

      <form onSubmit={onSaveProfile} className="space-y-6">
        <InlineErrorAlert message={profileError} onDismiss={() => setProfileError(null)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Username (Unique & Editable) */}
          <div className="space-y-1.5">
            <label className="font-code text-xs uppercase tracking-[0.14em] text-muted">Username</label>
            <div className="flex items-center gap-3 bg-card border border-ink/[0.14] focus-within:border-brand rounded-xl px-4 h-12 transition-colors">
              <User className="text-muted text-base shrink-0" />
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => handleProfileChange("username", e.target.value)}
                placeholder="Username"
                className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm font-ui font-medium"
                required
                minLength={4}
                maxLength={30}
              />
              {profileForm.username.trim().length >= 4 && <Check className="text-ok shrink-0" />}
            </div>
            <p className="text-sm font-ui text-muted pl-1">4–30 letters, numbers or underscores</p>
          </div>

          {/* Email (Read-Only with Copy Action) */}
          <div className="space-y-1.5">
            <label className="font-code text-xs uppercase tracking-[0.14em] text-muted">Email</label>
            <div className="flex items-center justify-between gap-3 border border-ink/[0.1] bg-ink/[0.03] rounded-xl px-4 h-12 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <Envelope className="text-muted text-base shrink-0" />
                <span className="text-fg-3 text-sm font-ui font-medium truncate select-all">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] sm:min-h-0 rounded-lg bg-ink/[0.05] hover:bg-ink/[0.1] text-fg-3 hover:text-fg text-xs font-ui transition-colors shrink-0 cursor-pointer min-h-[36px]"
                title="Copy Email"
              >
                <motion.span {...pop(copiedEmail ? "ok" : "copy", copiedEmail)}>{copiedEmail ? <Check className="text-ok text-xs" /> : <Copy className="text-xs" />}</motion.span>
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-sm font-ui text-muted pl-1">The email you sign in with</p>
          </div>
        </div>

        {/* Identicon Presets */}
        <div className="pt-4 border-t border-ink/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-code text-xs uppercase tracking-[0.14em] text-muted">
              Avatar
            </label>
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="flex items-center gap-1.5 text-xs font-ui text-brand hover:text-brand-hover transition-colors font-medium cursor-pointer min-h-[44px]"
            >
              <ArrowsClockwise className="text-xs" /> Shuffle
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
                      ? "bg-brand/15 border-brand/45 font-semibold text-brand"
                      : "bg-card border-ink/[0.2] text-fg-3 hover:border-ink/[0.4] hover:text-fg"
                  }`}
                >
                  <img src={avatarUrl} alt={preset.label} className="w-6 h-6 rounded-lg bg-inset/40" />
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
                ? "amber-specular-button text-on-brand font-bold cursor-pointer"
                : "bg-ink/[0.04] border border-ink/[0.08] text-muted cursor-not-allowed"
            }`}
          >
            {isSavingProfile ? <InlineSpinner size={16} color="var(--on-brand)" /> : justSaved ? <motion.span {...pop("saved", true)}><Check className="text-ok" /></motion.span> : <FloppyDisk />}
            {isSavingProfile ? "Saving..." : justSaved ? "Saved" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdentityCard;
