import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });

  const isProduction = ENV.NODE_ENV === 'production';

  res.cookie(ENV.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return token;
};

export const clearTokenCookie = (res) => {
  const isProduction = ENV.NODE_ENV === 'production';
  res.cookie(ENV.COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  });
};
