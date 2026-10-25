import mongoose from 'mongoose';
import { Report } from '../models/Report.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';

// @desc    Submit a report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Target type, target ID, and reason are required',
      });
    }

    if (!['POST', 'USER', 'EVENT'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type. Must be POST, USER, or EVENT',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target ID format',
      });
    }

    // Verify target existence
    let targetExists = false;
    if (targetType === 'POST') {
      targetExists = await Post.exists({ _id: targetId });
    } else if (targetType === 'USER') {
      targetExists = await User.exists({ _id: targetId });
    } else if (targetType === 'EVENT') {
      targetExists = await Event.exists({ _id: targetId });
    }

    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `Reported ${targetType.toLowerCase()} does not exist`,
      });
    }

    // Check for duplicate pending report from the same reporter
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
      status: 'OPEN',
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an open report for this item. Our moderation team is reviewing it.',
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      description: description ? description.trim() : '',
      status: 'OPEN',
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping keep CampusConnect safe.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAdminReports = async (req, res, next) => {
  try {
    const { status = 'OPEN', page = 1, limit = 20 } = req.query;

    const query = {};
    if (status !== 'ALL') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [reports, totalReports] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'name email department')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Report.countDocuments(query),
    ]);

    // Enhance reports with target preview info
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject();
        if (report.targetType === 'POST') {
          reportObj.targetData = await Post.findById(report.targetId)
            .select('title type status author')
            .populate('author', 'name email');
        } else if (report.targetType === 'USER') {
          reportObj.targetData = await User.findById(report.targetId).select(
            'name email role isActive department'
          );
        } else if (report.targetType === 'EVENT') {
          reportObj.targetData = await Event.findById(report.targetId).select(
            'title venue startsAt status'
          );
        }
        return reportObj;
      })
    );

    return res.status(200).json({
      success: true,
      data: populatedReports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalReports,
        totalPages: Math.ceil(totalReports / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (Admin)
// @route   PATCH /api/admin/reports/:id
// @access  Private/Admin
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['REVIEWED', 'DISMISSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either REVIEWED or DISMISSED',
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = status;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    return res.status(200).json({
      success: true,
      message: `Report marked as ${status.toLowerCase()}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin moderation action: toggle user active/suspended
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Protect against self-suspension
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own account',
      });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isActive ? 'reactivated' : 'suspended'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin moderation action: remove inappropriate post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Post removed by moderation',
    });
  } catch (error) {
    next(error);
  }
};
