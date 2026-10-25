import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  updateEventStatus,
  saveEvent,
  unsaveEvent,
} from '../controllers/eventController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);

// Admin-only event management
router.post('/', protect, requireAdmin, createEvent);
router.patch('/:id', protect, requireAdmin, updateEvent);
router.patch('/:id/status', protect, requireAdmin, updateEventStatus);

// Student bookmarking
router.post('/:id/save', protect, saveEvent);
router.delete('/:id/save', protect, unsaveEvent);

export default router;
