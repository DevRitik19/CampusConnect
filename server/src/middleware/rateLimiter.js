import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per window
  message: {
    success: false,
    message: 'Too many login/registration attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests created from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
