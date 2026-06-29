/**
 * extractError — single utility to pull a human-readable message from any
 * thrown value (axios error, AppError shape, plain Error, string, etc.)
 *
 * @param {unknown} err      - The caught error value
 * @param {string}  fallback - Message to use if nothing else is found
 * @returns {string}
 */
export function extractError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;

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
