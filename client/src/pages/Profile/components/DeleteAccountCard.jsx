import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { InlineSpinner } from "../../../components/ui/Skeletons";
import { InlineErrorAlert } from "../../../components/ui/ErrorComponents";
import { deleteUserAccount } from "../../../api/services/userService";

// ── 6. GDPR Privacy & Account Deletion (warning card + confirmation modal) ──
const DeleteAccountCard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      // Go to /register first (flushSync commits the route change immediately), then clear the user. Clearing the
      // user while still on this page lets the route guard redirect to /login, so /register was never reached.
      await navigate("/register", { flushSync: true });
      setUser(null);
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message || err.message || "Failed to delete account. Please check your credentials."
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <div className="bg-rose-500/[0.02] border border-rose-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div>
          <h3 className="font-display text-sm font-bold text-rose-400 flex items-center gap-2">
            <FiAlertTriangle /> Delete account
          </h3>
          <p className="text-xs font-ui text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Permanently delete your profile, your solved-problem progress and your saved project ideas. This action is irreversible.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setDeleteConfirmation("");
            setShowDeleteModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 hover:border-rose-500/40 transition-colors font-ui font-semibold text-xs cursor-pointer shrink-0 min-h-[44px]"
        >
          Delete Account...
        </button>
      </div>

      {/* ── Account Deletion Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 26, stiffness: 360 }}
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
                <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1 font-ui text-xs">
                  <li>All solved DSA problem tracker entries across all sheets.</li>
                  <li>All compiled system architecture blueprints.</li>
                  <li>Your sign-in details and all signed-in devices.</li>
                </ul>
              </div>

              <InlineErrorAlert message={deleteError} onDismiss={() => setDeleteError(null)} />

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-ui font-medium text-zinc-300">
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
                    className="w-full bg-[#121216] border border-white/[0.08] focus:border-rose-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors font-ui"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 text-xs font-ui font-semibold rounded-xl bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] transition-colors cursor-pointer min-h-[44px]"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeleteAccountCard;
