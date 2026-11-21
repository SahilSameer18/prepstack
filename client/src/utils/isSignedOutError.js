// Only the server saying "no valid session" (401 or 403) means the person is signed out.
// A lost connection, a timeout or a 5xx says nothing about the session: do not treat it as a sign-out.
export const isSignedOutError = (err) => {
  const status = err?.response?.status;
  return status === 401 || status === 403;
};
