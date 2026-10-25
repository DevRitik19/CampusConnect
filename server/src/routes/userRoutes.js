import express from 'express';
import {
  getUserProfile,
  updateMyProfile,
  getMyPosts,
  getMySaved,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me/posts', protect, getMyPosts);
router.get('/me/saved', protect, getMySaved);
router.patch('/me', protect, updateMyProfile);
router.get('/:id', optionalAuth, getUserProfile);

export default router;
