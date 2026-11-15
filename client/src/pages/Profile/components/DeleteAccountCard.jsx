import { useState, useEffect, useRef } from "react";
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
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!showDeleteModal) return;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    cancelRef.current?.focus();
    return () => { dialog.close(); previousFocus?.focus(); };
  }, [showDeleteModal]);

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
      try { localStorage.removeItem(`prepstack_problem_notes_pending_v1:${user._id || user.id}`); } catch { /* Browser storage may be unavailable. */ }
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
      <div className="bg-bad-solid/[0.02] border border-bad-solid/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
        <div>
          <h3 className="font-display text-sm font-bold text-bad flex items-center gap-2">
            <FiAlertTriangle /> Delete account
          </h3>
          <p className="text-xs font-ui text-muted mt-1 max-w-xl leading-relaxed">
            Permanently delete your profile, solved-problem progress, problem notes, saved project ideas, role reports, and all current and historical study plans. This action is irreversible.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setDeleteConfirmation("");
            setShowDeleteModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-bad-solid/10 hover:bg-bad-solid/20 text-bad border border-bad-solid/25 hover:border-bad-solid/40 transition-colors font-ui font-semibold text-xs cursor-pointer shrink-0 min-h-[44px]"
        >
          Delete Account...
        </button>
      </div>

      {/* ── Account Deletion Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <dialog
            ref={dialogRef}
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return;
              const controls = [...event.currentTarget.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex="0"]')];
              const first = controls[0], last = controls.at(-1);
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}
            onCancel={(event) => { event.preventDefault(); if (!isDeletingAccount) setShowDeleteModal(false); }}
            className="fixed m-auto w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 bg-transparent text-fg backdrop:bg-scrim/80 backdrop:backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 26, stiffness: 360 }}
              className="w-full max-w-md bg-card border border-bad-solid/30 rounded-2xl p-6 space-y-5 shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between border-b border-ink/[0.08] pb-4">
                <div className="flex items-center gap-2.5 text-bad font-display font-bold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-bad-solid/10 flex items-center justify-center text-base">
                    <FiAlertTriangle />
                  </div>
                  <span id="delete-account-title">Delete Account Permanently</span>
                </div>
                <button
                  type="button"
                  aria-label="Close delete account dialog"
                  disabled={isDeletingAccount}
                  onClick={() => setShowDeleteModal(false)}
                  className="text-muted hover:text-fg p-1 cursor-pointer transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="text-xs text-fg-3 space-y-2 leading-relaxed">
                <p id="delete-account-description">This action is irreversible. The following data will be permanently wiped:</p>
                <ul className="list-disc list-inside space-y-1 text-muted pl-1 font-ui text-xs">
                  <li>All solved DSA problem tracker entries across all sheets.</li>
                  <li>All your notes on DSA problems.</li>
                  <li>All your saved AI project ideas.</li>
                  <li>All your Role Analyzer reports and their study-plan ticks.</li>
                  <li>All current and historical study plans, results and review dates.</li>
                  <li>Your sign-in details and all signed-in devices.</li>
                </ul>
              </div>

              <InlineErrorAlert message={deleteError} onDismiss={() => setDeleteError(null)} />

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="delete-account-confirmation" className="text-xs font-ui font-medium text-fg-3">
                    {user.hasPassword ? (
                      "Enter current password to verify:"
                    ) : (
                      <span>Type email <strong className="text-fg select-all">{user.email}</strong> to verify:</span>
                    )}
                  </label>
                  <input
                    id="delete-account-confirmation"
                    type={user.hasPassword ? "password" : "text"}
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={user.hasPassword ? "Enter current password" : user.email}
                    required
                    className="w-full bg-card-hover border border-ink/[0.08] focus:border-bad-solid/50 rounded-xl px-4 py-2.5 text-sm text-fg placeholder-faint outline-none transition-colors font-ui"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    ref={cancelRef}
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 text-xs font-ui font-semibold rounded-xl bg-ink/[0.05] text-fg-3 hover:bg-ink/[0.1] transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeletingAccount}
                    className="px-5 py-2 text-xs font-display font-semibold rounded-xl bg-bad-solid hover:bg-bad-solid text-fg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-bad-solid/20 min-h-[44px]"
                  >
                    {isDeletingAccount && <InlineSpinner size={14} color="var(--fg)" />}
                    {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </form>
            </motion.div>
          </dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeleteAccountCard;
