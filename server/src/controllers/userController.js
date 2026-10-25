import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Event } from '../models/Event.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public / Optional Auth
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name department year bio avatarUrl role createdAt isActive'
    );

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found or is currently inactive',
      });
    }

    // Get author's active public listings
    const posts = await Post.find({
      author: user._id,
      status: { $in: ['ACTIVE', 'RESOLVED', 'SOLD', 'CLOSED'] },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        user,
        posts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current logged-in user profile
// @route   PATCH /api/users/me
// @access  Private
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, department, year, bio, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (year !== undefined) user.year = year.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's posts
// @route   GET /api/users/me/posts
// @access  Private
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's saved posts and events
// @route   GET /api/users/me/saved
// @access  Private
export const getMySaved = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedPosts',
        populate: { path: 'author', select: 'name avatarUrl department' },
      })
      .populate({
        path: 'savedEvents',
        populate: { path: 'author', select: 'name' },
      });

    return res.status(200).json({
      success: true,
      data: {
        posts: user.savedPosts || [],
        events: user.savedEvents || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
