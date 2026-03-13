const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAsClicked
} = require('../controllers/notificationController');
const router = express.Router();

router.get('/', authenticate, getMyNotifications);
router.get('/unread', authenticate, getUnreadCount);
router.post('/:notificationId/read', authenticate, markAsRead);
router.post('/read-all', authenticate, markAllAsRead);
router.post('/:notificationId/click', authenticate, markAsClicked);

module.exports = router;