import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FiLock, FiCheck, FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../../hooks/useAuth";
import { InlineSpinner } from "../../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../../components/ui/ErrorComponents";
import { changeUserPassword } from "../../../api/services/userService";

// ── 3. Security & Authentication Card (Google link status + set/change password) ──
const SecurityCard = () => {
  const { user, setUser, handleLinkGoogle, handleSetPassword } = useAuth();
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

  const isGoogleLinked = user.providers?.some((p) => p.providerName === "google");

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
        const updatedUser = response?.data?.user || response?.user;
        if (updatedUser) {
          setUser(updatedUser);
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

  return (
    <div className="titanium-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent" />
      <div className="pb-4 border-b border-ink/[0.06]">
        <h2 className="font-display text-lg font-bold text-fg flex items-center gap-2">
          <FiShield className="text-brand" /> Sign-in & security
        </h2>
        <p className="text-xs font-ui text-muted mt-1">Link your Google account and manage your password.</p>
      </div>

      <div className="space-y-4">
        {/* Google Provider Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card-hover gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-ink/[0.04] flex items-center justify-center text-fg-3 text-lg">
              <FaGoogle />
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">Google account</p>
              <p className="text-xs font-ui text-muted">
                {isGoogleLinked ? "Linked for passwordless SSO login" : "No external Google account linked"}
              </p>
            </div>
          </div>

          {isGoogleLinked ? (
            <div className="text-xs font-ui font-semibold px-3 py-1 rounded-full bg-ok-solid/10 text-ok border border-ok-solid/25 self-start sm:self-auto flex items-center gap-1.5">
              <FiCheck /> Linked & Verified
            </div>
          ) : (
            <div className="self-start sm:self-auto" style={{ colorScheme: "light" }}>
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
        <div className="p-4 rounded-xl bg-card-hover space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-ink/[0.04] flex items-center justify-center text-fg-3 text-lg">
                <FiLock />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">Account Password</p>
                <p className="text-xs font-ui text-muted">
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
              className="px-4 py-2 text-xs font-ui font-semibold rounded-xl bg-ink/[0.05] text-fg hover:bg-ink/[0.1] transition-colors self-start sm:self-auto cursor-pointer min-h-[44px]"
            >
              {showPasswordSection ? "Close Form" : user.hasPassword ? "Change Password" : "Set Password"}
            </button>
          </div>

          {/* Expandable Password Form */}
          <AnimatePresence>
            {showPasswordSection && (
              <form
                onSubmit={onPasswordSubmit}
                className="pt-4 border-t border-ink/[0.06] space-y-4"
              >
                <InlineErrorAlert message={passwordError} onDismiss={() => setPasswordError(null)} />

                {user.hasPassword && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-ui font-medium text-fg-3">Current Password</label>
                    <div className="relative flex items-center bg-card border border-ink/[0.08] rounded-xl px-4 h-11 focus-within:border-brand">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password to verify"
                        className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm pr-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 text-muted hover:text-fg cursor-pointer"
                      >
                        {showCurrentPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-ui font-medium text-fg-3">
                      {user.hasPassword ? "New Password" : "Create Password"}
                    </label>
                    <div className="relative flex items-center bg-card border border-ink/[0.08] rounded-xl px-4 h-11 focus-within:border-brand">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Min 8 characters"
                        className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm pr-8"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 text-muted hover:text-fg cursor-pointer"
                      >
                        {showNewPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-ui font-medium text-fg-3">Confirm New Password</label>
                    <div className="flex items-center bg-card border border-ink/[0.08] rounded-xl px-4 h-11 focus-within:border-brand">
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full bg-transparent text-fg placeholder-faint outline-none text-sm"
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
                    className="px-4 py-2 text-xs font-ui font-semibold rounded-xl bg-ink/[0.05] text-muted hover:bg-ink/[0.1] transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="px-5 py-2 text-xs font-display font-semibold rounded-xl amber-specular-button text-on-brand transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold min-h-[44px]"
                  >
                    {isSubmittingPassword ? <InlineSpinner size={14} color="var(--on-brand)" /> : null}
                    {isSubmittingPassword ? "Saving..." : user.hasPassword ? "Verify & Update Password" : "Set Password"}
                  </button>
                </div>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SecurityCard;
