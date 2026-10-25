import { Event } from '../models/Event.js';
import { User } from '../models/User.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const { category, status, upcoming, page = 1, limit = 12 } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'PUBLISHED';
    }

    if (upcoming === 'true') {
      query.startsAt = { $gte: new Date() };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [events, totalEvents] = await Promise.all([
      Event.find(query)
        .populate('author', 'name')
        .sort({ startsAt: 1 })
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalEvents / limitNum);

    return res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalEvents,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('author', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new official event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, venue, startsAt, endsAt, registrationUrl, imageUrl } =
      req.body;

    if (!title || !description || !venue || !startsAt) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, venue, and start time are required',
      });
    }

    const startDate = new Date(startsAt);
    const endDate = endsAt ? new Date(endsAt) : undefined;

    if (endDate && endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'Event end time cannot be before start time',
      });
    }

    const event = await Event.create({
      author: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Workshop',
      venue: venue.trim(),
      startsAt: startDate,
      endsAt: endDate,
      registrationUrl: registrationUrl ? registrationUrl.trim() : '',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      status: 'PUBLISHED',
    });

    return res.status(201).json({
      success: true,
      message: 'Official event published successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PATCH /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const { title, description, category, venue, startsAt, endsAt, registrationUrl, imageUrl, status } =
      req.body;

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (category) event.category = category;
    if (venue) event.venue = venue.trim();
    if (startsAt) event.startsAt = new Date(startsAt);
    if (endsAt) event.endsAt = new Date(endsAt);
    if (registrationUrl !== undefined) event.registrationUrl = registrationUrl.trim();
    if (imageUrl !== undefined) event.imageUrl = imageUrl.trim();
    if (status && ['PUBLISHED', 'CANCELLED'].includes(status)) event.status = status;

    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event status
// @route   PATCH /api/events/:id/status
// @access  Private/Admin
export const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PUBLISHED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either PUBLISHED or CANCELLED',
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = status;
    await event.save();

    return res.status(200).json({
      success: true,
      message: `Event status updated to ${status.toLowerCase()}`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save event to user bookmarks
// @route   POST /api/events/:id/save
// @access  Private
export const saveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedEvents: event._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Event saved to bookmarks',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave event
// @route   DELETE /api/events/:id/save
// @access  Private
export const unsaveEvent = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedEvents: req.params.id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Event removed from bookmarks',
    });
  } catch (error) {
    next(error);
  }
};
