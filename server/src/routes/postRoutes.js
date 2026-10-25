import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  savePost,
  unsavePost,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.post('/', protect, createPost);
router.get('/:id', optionalAuth, getPostById);
router.patch('/:id', protect, updatePost);
router.patch('/:id/status', protect, updatePostStatus);
router.delete('/:id', protect, deletePost);

// Save / Unsave post
router.post('/:id/save', protect, savePost);
router.delete('/:id/save', protect, unsavePost);

export default router;
