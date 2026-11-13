const rateLimit = require("express-rate-limit");
const { HOUR_MS, PROJECTS_PER_HOUR, REPORTS_PER_HOUR, PLAN_TICKS_PER_MINUTE, PLAN_PREVIEWS_PER_MINUTE, PLAN_GENERATES_PER_HOUR, PLAN_CHANGES_PER_MINUTE, PROBLEM_NOTE_WRITES_PER_MINUTE } = require("../config/limits");

const aiProjectLimiter = rateLimit({
  windowMs: HOUR_MS,
  max: PROJECTS_PER_HOUR, // per user
  skipFailedRequests: true, // if response is 4xx/5xx, don't count it
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "Too many Project idea generation requests. Please try again after an hour.",
    errors: [`Rate limit exceeded. Maximum ${PROJECTS_PER_HOUR} project ideas generated per hour.`],
  },
  standardHeaders: true, // sends RateLimit headers in response
  legacyHeaders: false,
});

// Login / Google sign-in / set-password: only FAILED attempts count, so wrong-password guessing is throttled
// but a whole college behind one campus Wi-Fi address can still log in normally.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 failed attempts per 15 min per IP
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
    errors: ["Rate limit exceeded. Please try again after 15 minutes."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sign-ups: every request counts (stops one address mass-creating accounts), with room for a class signing up together.
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many sign-up attempts. Please try again after 15 minutes.",
    errors: ["Rate limit exceeded. Please try again after 15 minutes."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const linkGoogleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // 5 attempts per 15 min per IP
  message: { 
    success: false, 
    message: "Too many linking attempts. Please try again later.",
    errors: ["Rate limit exceeded. Please try again after 15 minutes."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password change and account deletion ask for the current password. Only FAILED tries count, per signed-in user, so a
// stolen session cannot be used to guess the password (and one user's mistakes never affect another).
const accountActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "Too many failed attempts. Please try again after 15 minutes.",
    errors: ["Rate limit exceeded. Please try again after 15 minutes."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Role Analyzer reports: 3 per hour per signed-in user. Only SAVED reports count (a failed attempt is free), because a
// report is a large AI call and the free AI quota is shared by everyone.
const analyzerLimiter = rateLimit({
  windowMs: HOUR_MS,
  max: REPORTS_PER_HOUR,
  skipFailedRequests: true,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "You've created several reports in the last hour. Please try again later.",
    errors: [`Rate limit exceeded. Maximum ${REPORTS_PER_HOUR} reports per hour.`],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ticking a study-plan item: cheap, so a high limit; it only stops a stuck script from hammering the database.
const planTickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: PLAN_TICKS_PER_MINUTE,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "You're ticking items too fast. Please wait a moment.",
    errors: [`Rate limit exceeded. Maximum ${PLAN_TICKS_PER_MINUTE} ticks per minute.`],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// My plan: the public preview needs no login, so it is limited per IP address (every request counts; it makes no database write).
const planPreviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: PLAN_PREVIEWS_PER_MINUTE,
  message: {
    success: false,
    message: "You're previewing plans too fast. Please wait a moment.",
    errors: [`Rate limit exceeded. Maximum ${PLAN_PREVIEWS_PER_MINUTE} previews per minute.`],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// My plan: making or replacing a saved plan, per signed-in user. Only saved plans count.
const planGenerateLimiter = rateLimit({
  windowMs: HOUR_MS,
  max: PLAN_GENERATES_PER_HOUR,
  skipFailedRequests: true,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "You've made several plans in the last hour. Please try again later.",
    errors: [`Rate limit exceeded. Maximum ${PLAN_GENERATES_PER_HOUR} plans per hour.`],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// My plan: previewing and applying a rebuild, new hours or lighter days.
const planChangeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: PLAN_CHANGES_PER_MINUTE,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "You're changing the plan too fast. Please wait a moment.",
    errors: [`Rate limit exceeded. Maximum ${PLAN_CHANGES_PER_MINUTE} plan changes per minute.`],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Saving, deleting or importing problem notes (reading is not limited).
const problemNoteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: PROBLEM_NOTE_WRITES_PER_MINUTE,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "You're saving notes too fast. Please wait a moment.",
    errors: [`Rate limit exceeded. Maximum ${PROBLEM_NOTE_WRITES_PER_MINUTE} note saves per minute.`],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset emails: every request counts (each one can cost an email), 5 per 15 minutes per address.
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many reset requests. Please try again after 15 minutes.",
    errors: ["Rate limit exceeded. Please try again after 15 minutes."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Setting the new password: only failed tries count (a wrong or already-used link).
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
    errors: ["Rate limit exceeded. Please try again after 15 minutes."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 refresh attempts per 15 min per IP
  message: {
    success: false,
    message: "Too many session refresh attempts. Please log in again.",
    errors: ["Rate limit exceeded. Please log in again."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, registerLimiter, accountActionLimiter, analyzerLimiter, planTickLimiter, planPreviewLimiter, planGenerateLimiter, planChangeLimiter, problemNoteLimiter, aiProjectLimiter, linkGoogleLimiter, refreshLimiter, forgotPasswordLimiter, resetPasswordLimiter };