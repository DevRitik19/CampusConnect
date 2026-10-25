import express from 'express';
import {
  getOrCreateConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', getOrCreateConversation);
router.get('/', getMyConversations);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markConversationRead);

export default router;
