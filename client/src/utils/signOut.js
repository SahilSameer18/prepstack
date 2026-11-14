// Runs a sign-out call and keeps the overlay up for `waitMs`. Resolves only when the server ended the
// requested sessions. A refused request cannot confirm revocation, especially on other devices.
export const SIGN_OUT_FAILED = 'Could not confirm sign-out. Check your connection or sign in again, then retry.';

export async function signOut(call, waitMs = 800) {
  const [result] = await Promise.allSettled([call(), new Promise((resolve) => setTimeout(resolve, waitMs))]);
  if (result.status === 'fulfilled') return;
  throw new Error(SIGN_OUT_FAILED);
}
