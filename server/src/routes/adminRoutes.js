import express from 'express';
import {
  getAdminReports,
  updateReportStatus,
  toggleUserStatus,
  adminDeletePost,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/reports', getAdminReports);
router.patch('/reports/:id', updateReportStatus);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/posts/:id', adminDeletePost);

export default router;
