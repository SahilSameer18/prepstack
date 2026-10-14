/**
 * Utility to sanitize Mongoose documents and format unified JSON responses.
 *
 * Unified API Contract:
 *  - Success: { success: true, message: string, data: any }
 *  - Failure: { success: false, message: string, errors: array }
 */

/**
 * Strips internal MongoDB metadata (__v, etc.) from an object or array of objects.
 * Handles Mongoose documents (via .toObject()) or plain JS objects.
 */
function sanitizeDoc(doc) {
  if (!doc) return doc;

  if (Array.isArray(doc)) {
    return doc.map(sanitizeDoc);
  }

  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  if (obj.__v !== undefined) {
    delete obj.__v;
  }

  return obj;
}

/**
 * Standardized success response builder.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} data
 * @param {object} [extraFields] Optional backward-compatibility fields (e.g., top-level user/project)
 */
function sendSuccess(res, statusCode, message, data = null, extraFields = {}) {
  const sanitizedData = sanitizeDoc(data);
  return res.status(statusCode).json({
    success: true,
    message,
    data: sanitizedData,
    ...extraFields
  });
}

module.exports = {
  sanitizeDoc,
  sendSuccess
};
