import dotenv from 'dotenv';
import { validateCollegeDomainConfig } from '../utils/collegeEmail.js';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'campusconnect_token',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COLLEGE_NAME: process.env.COLLEGE_NAME || 'Scaler School of Technology',
  COLLEGE_EMAIL_DOMAIN: process.env.COLLEGE_EMAIL_DOMAIN !== undefined
    ? process.env.COLLEGE_EMAIL_DOMAIN.toLowerCase().trim()
    : (process.env.NODE_ENV === 'production' ? '' : 'campus.edu'),
};

// Fail fast in production if required environment variables are missing
if (ENV.NODE_ENV === 'production') {
  if (!ENV.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret_for_dev_only') {
    console.error('FATAL: A secure, non-default JWT_SECRET environment variable is required in production.');
    process.exit(1);
  }
  const domainValidation = validateCollegeDomainConfig({
    domain: ENV.COLLEGE_EMAIL_DOMAIN,
    nodeEnv: 'production',
  });
  if (!domainValidation.valid) {
    console.error(`FATAL: ${domainValidation.error}`);
    process.exit(1);
  }
} else if (!ENV.MONGODB_URI) {
  console.warn('WARN: MONGODB_URI environment variable is not defined. Defaulting to mongodb://localhost:27017/campusconnect');
  ENV.MONGODB_URI = 'mongodb://localhost:27017/campusconnect';
}

