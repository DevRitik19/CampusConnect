import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';

// @desc    Get or create a conversation between current user and recipient
// @route   POST /api/conversations
// @access  Private
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, postId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID format',
      });
    }

    // Prevent self-conversations
    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself',
      });
    }

    // Verify recipient exists and is active
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user account does not exist or has been suspended',
      });
    }

    // Validate post if provided
    let verifiedPostId = null;
    if (postId && mongoose.Types.ObjectId.isValid(postId)) {
      const post = await Post.findById(postId);
      if (post) {
        verifiedPostId = post._id;
      }
    }

    // Look for existing conversation with these two participants
    const query = {
      participants: { $all: [req.user._id, recipient._id], $size: 2 },
    };
    if (verifiedPostId) {
      query.post = verifiedPostId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name avatarUrl department year')
      .populate('post', 'title type details category status')
      .populate('lastMessage');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [req.user._id, recipient._id],
        post: verifiedPostId,
        lastMessageAt: new Date(),
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatarUrl department year')
        .populate('post', 'title type details category status');
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatarUrl department year')
      .populate('post', 'title type details category status')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Security check: Only participants can view messages
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages in this conversation',
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 });

    // Mark unread messages as read by current user
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty',
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Security check
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    // Check if the other participant is suspended
    const otherParticipantId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    const otherUser = await User.findById(otherParticipantId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message because the recipient account is deactivated or suspended',
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
      readBy: [req.user._id],
    });

    // Update conversation metadata
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name avatarUrl'
    );

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation messages as read
// @route   PATCH /api/conversations/:id/read
// @access  Private
export const markConversationRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (error) {
    next(error);
  }
};
