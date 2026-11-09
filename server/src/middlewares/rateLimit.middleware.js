const rateLimit = require("express-rate-limit");

const aiProjectLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // 4 requests per hour per user
  skipFailedRequests: true, // if response is 4xx/5xx, don't count it
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "Too many Project idea generation requests. Please try again after an hour.",
    errors: ["Rate limit exceeded. Maximum 4 project ideas generated per hour."],
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
  windowMs: 60 * 60 * 1000,
  max: 3,
  skipFailedRequests: true,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: { keyGeneratorIpFallback: false },
  message: {
    success: false,
    message: "You've created several reports in the last hour. Please try again later.",
    errors: ["Rate limit exceeded. Maximum 3 reports per hour."],
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

module.exports = { authLimiter, registerLimiter, accountActionLimiter, analyzerLimiter, aiProjectLimiter, linkGoogleLimiter, refreshLimiter, forgotPasswordLimiter, resetPasswordLimiter };