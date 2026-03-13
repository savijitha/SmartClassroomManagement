const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
  setTyping,
  deleteMessage,
   getTypingUsers 
} = require('../controllers/chatController');
const router = express.Router();

// Message routes
router.post('/:classId/messages', authenticate, sendMessage);
router.get('/:classId/messages', authenticate, getMessages);
router.delete('/:classId/messages/:messageId', authenticate, deleteMessage);

// Read receipts
router.post('/:classId/messages/:messageId/read', authenticate, markAsRead);
router.get('/:classId/unread', authenticate, getUnreadCount);

// Typing indicators
router.post('/:classId/typing', authenticate, setTyping);
router.get('/:classId/typing', authenticate, getTypingUsers);
router.get('/:classId/typing', authenticate, getTypingUsers); 

module.exports = router;