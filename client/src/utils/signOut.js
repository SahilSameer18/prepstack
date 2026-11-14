// Runs a sign-out call and keeps the overlay up for `waitMs`. Resolves only when the server ended the
// session (or already had: 401/403). Any other failure throws, so the caller keeps the user signed in.
export const SIGN_OUT_FAILED = 'Could not sign you out. Check your connection and try again.';

export async function signOut(call, waitMs = 800) {
  const [result] = await Promise.allSettled([call(), new Promise((resolve) => setTimeout(resolve, waitMs))]);
  if (result.status === 'fulfilled') return;
  const status = result.reason?.response?.status;
  if (status === 401 || status === 403) return; // the session was already gone
  throw new Error(SIGN_OUT_FAILED);
}
