const Notification = require('../models/Notification');
const Class = require('../models/Class');
const User = require('../models/User');

const getMyNotifications = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const notifications = await Notification.getForUser(req.user.id, parseInt(limit));
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.markAsRead(notificationId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

const markAsClicked = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.markAsClicked(notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as clicked error:', error);
    res.status(500).json({ error: 'Failed to mark notification as clicked' });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAsClicked
};