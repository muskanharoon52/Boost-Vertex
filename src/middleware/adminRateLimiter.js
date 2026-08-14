const rateLimit = require('express-rate-limit');
const { protect } = require('./authMiddleware');

// Per-admin rate limiting: 1000 requests per 15 minutes per admin user
const adminRateLimiter = rateLimit({
  keyGenerator: (req, res) => {
    // Use admin ID from JWT token as the key
    return req.admin ? req.admin._id.toString() : req.ip;
  },
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: 'Too many admin requests from this account, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req, res) => {
    // Skip rate limiting for health checks and public endpoints
    return !req.admin;
  },
});

// Enhanced admin operation rate limiter: 100 write operations per 15 minutes
const adminWriteRateLimiter = rateLimit({
  keyGenerator: (req, res) => {
    return req.admin ? req.admin._id.toString() : req.ip;
  },
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 write operations per window
  message: 'Too many write operations from this account, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for non-admin requests
    return !req.admin;
  },
});

module.exports = { adminRateLimiter, adminWriteRateLimiter };
