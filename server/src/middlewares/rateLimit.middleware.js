const rateLimit = require("express-rate-limit");

const aiProjectLimiter =  rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // 4 requests per hour per IP
  skipFailedRequests: true, // if response is 4xx/5xx, don't count it
  message: {
    success: false,
    message: "Too many Project idea generation requests. Please try again after an hour.",
  },
  standardHeaders: true, // sends RateLimit headers in response
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per 15 min
  skipFailedRequests: true, // if response is 4xx/5xx, don't count it
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, aiProjectLimiter }
