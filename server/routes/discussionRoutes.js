const express = require('express');
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

const {
  createThread,
  getThreads,
  getThreadById,
  addComment,
  toggleUpvote,
  markAsResolved
} = require('../controllers/discussionController');
const router = express.Router();

// Thread routes
router.post('/:classId/threads', authenticate, createThread);
router.get('/:classId/threads', authenticate, getThreads);
router.get('/:classId/threads/:threadId', authenticate, getThreadById);
router.post('/:classId/threads/:threadId/comments', authenticate, addComment);
router.post('/:classId/threads/:threadId/upvote', authenticate, toggleUpvote);
router.post('/:classId/threads/:threadId/resolve', authenticate, markAsResolved);

module.exports = router;