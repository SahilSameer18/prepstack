/**
 * extractError: single utility to pull a human-readable message from any
 * thrown value (axios error, AppError shape, plain Error, string, etc.)
 *
 * @param {unknown} err      - The caught error value
 * @param {string}  fallback - Message to use if nothing else is found
 * @returns {string}
 */
export function extractError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;

  // No response at all: the request timed out or the connection failed (axios would say "timeout of 30000ms
  // exceeded" / "Network Error", which means nothing to a user)
  if (err.isAxiosError && !err.response) {
    return err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT'
      ? 'The request took too long. Please check your connection and try again.'
      : "Can't reach the server. Please check your connection and try again.";
  }

  // Axios / fetch error with a server JSON body  → { message: "..." }
  if (err?.response?.data?.message) return err.response.data.message;

  // Axios / fetch error with a server JSON body → { errors: [{message}] }
  if (err?.response?.data?.errors?.[0]?.message) return err.response.data.errors[0].message;

  // Plain JS Error or AppError
  if (err?.message) return err.message;

  // String thrown directly
  if (typeof err === 'string') return err;

  return fallback;
}
