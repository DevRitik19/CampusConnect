import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'campusconnect_token',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COLLEGE_NAME: process.env.COLLEGE_NAME || 'Apex Institute of Technology',
  COLLEGE_EMAIL_DOMAIN: (process.env.COLLEGE_EMAIL_DOMAIN || 'campus.edu').toLowerCase().trim(),
};

// Fail fast in production if required vars missing
if (!ENV.MONGODB_URI) {
  console.error('FATAL: MONGODB_URI environment variable is not defined.');
  if (ENV.NODE_ENV === 'production') {
    process.exit(1);
  }
}
