import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

// @desc    Get all posts with filters & pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const {
      type,
      category,
      status,
      search,
      location,
      sort,
      itemState,
      collaborationType,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Filter by post type
    if (type && ['LOST_FOUND', 'MARKETPLACE', 'COLLABORATION'].includes(type)) {
      query.type = type;
    }

    // Filter by status (default to ACTIVE unless specified or viewing all)
    if (status) {
      if (status !== 'ALL') {
        query.status = status;
      }
    } else {
      query.status = 'ACTIVE';
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Specific detail filters
    if (itemState && ['LOST', 'FOUND'].includes(itemState)) {
      query['details.itemState'] = itemState;
    }

    if (collaborationType) {
      query['details.collaborationType'] = collaborationType;
    }

    // Search query (safe regex match against title, description, or tags)
    if (search && search.trim() !== '') {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $regex: sanitizedSearch, $options: 'i' } },
        { location: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // newest first default
    if (sort === 'price_asc') {
      sortOption = { 'details.price': 1, createdAt: -1 };
    } else if (sort === 'price_desc') {
      sortOption = { 'details.price': -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .populate('author', 'name avatarUrl department year')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPosts / limitNum);

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPosts,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'name avatarUrl department year createdAt'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post listing not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Authenticated Student/Admin)
export const createPost = async (req, res, next) => {
  try {
    const { type, title, description, category, images, tags, location, details } = req.body;

    if (!type || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, description, and category are required',
      });
    }

    // Validate details based on type
    const validatedDetails = {};

    if (type === 'LOST_FOUND') {
      if (!details || !details.itemState || !['LOST', 'FOUND'].includes(details.itemState)) {
        return res.status(400).json({
          success: false,
          message: 'Lost & Found posts require itemState to be either LOST or FOUND',
        });
      }
      validatedDetails.itemState = details.itemState;
      validatedDetails.dateOccurred = details.dateOccurred ? new Date(details.dateOccurred) : new Date();
    } else if (type === 'MARKETPLACE') {
      if (details?.price === undefined || Number(details.price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Marketplace posts require a valid non-negative price in INR',
        });
      }
      validatedDetails.price = Number(details.price);
      validatedDetails.condition = details.condition || 'GOOD';
      validatedDetails.itemType = details.itemType || '';
    } else if (type === 'COLLABORATION') {
      validatedDetails.subject = details?.subject || '';
      validatedDetails.skills = Array.isArray(details?.skills) ? details.skills : [];
      validatedDetails.availability = details?.availability || '';
      validatedDetails.collaborationType = details?.collaborationType || 'STUDY_PARTNER';
    }

    const post = await Post.create({
      author: req.user._id,
      type,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      location: location ? location.trim() : '',
      details: validatedDetails,
      status: 'ACTIVE',
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name avatarUrl department year'
    );

    return res.status(201).json({
      success: true,
      message: 'Post listing published successfully',
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing post
// @route   PATCH /api/posts/:id
// @access  Private (Owner or Admin)
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post listing not found',
      });
    }

    // Authorization check
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing',
      });
    }

    const { title, description, category, images, tags, location, details, status } = req.body;

    if (title) post.title = title.trim();
    if (description) post.description = description.trim();
    if (category) post.category = category.trim();
    if (images) post.images = Array.isArray(images) ? images : post.images;
    if (tags) post.tags = Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : post.tags;
    if (location !== undefined) post.location = location.trim();
    if (status && ['ACTIVE', 'RESOLVED', 'SOLD', 'CLOSED'].includes(status)) {
      post.status = status;
    }

    if (details) {
      post.details = { ...post.details, ...details };
    }

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      'author',
      'name avatarUrl department year'
    );

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post status (resolve/close/sell)
// @route   PATCH /api/posts/:id/status
// @access  Private (Owner or Admin)
export const updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['ACTIVE', 'RESOLVED', 'SOLD', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to change the status of this listing',
      });
    }

    post.status = status;
    await post.save();

    return res.status(200).json({
      success: true,
      message: `Listing marked as ${status.toLowerCase()}`,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Owner or Admin)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Post listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save post to user's saved items
// @route   POST /api/posts/:id/save
// @access  Private
export const savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedPosts: post._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Post saved to your bookmarks',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave post from user's saved items
// @route   DELETE /api/posts/:id/save
// @access  Private
export const unsavePost = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedPosts: req.params.id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Post removed from your bookmarks',
    });
  } catch (error) {
    next(error);
  }
};
