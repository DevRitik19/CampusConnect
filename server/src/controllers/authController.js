import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';
import { generateToken, clearTokenCookie } from '../utils/generateToken.js';

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, department, year, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, college email, and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Enforce college email domain
    const expectedDomain = `@${ENV.COLLEGE_EMAIL_DOMAIN}`;
    if (!normalizedEmail.endsWith(expectedDomain)) {
      return res.status(400).json({
        success: false,
        message: `Please use your valid college email address ending with ${expectedDomain}`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this college email already exists. Please log in.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user - strictly enforce STUDENT role regardless of request body
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      department: department ? department.trim() : '',
      year: year ? year.trim() : '',
      bio: bio ? bio.trim() : '',
      role: 'STUDENT', // Security: public registration cannot create ADMIN
      isEmailVerified: true,
      isActive: true,
    });

    // Set auth cookie
    generateToken(res, newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & issue token cookie
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user with passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended. Please contact an administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Issue JWT cookie
    generateToken(res, user._id);

    // Fetch clean user without password
    const cleanUser = await User.findById(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: cleanUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
