const Chat = require('../models/Chat');
const Class = require('../models/Class');
const { db } = require('../config/firebase');

const sendMessage = async (req, res) => {
  try {
    const { classId } = req.params;
    const { message, messageType } = req.body;  // Remove fileUrl, fileName for now

    // Verify user has access to this class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if user is teacher or enrolled student
    const isTeacher = classData.teacherId === req.user.id;
    const isEnrolled = classData.students?.includes(req.user.id);
    
    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ error: 'Not authorized to chat in this class' });
    }

    // ✅ Only send required fields, no undefined values
    const chatMessage = await Chat.send(classId, {
      message,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      messageType: messageType || 'text'
      // Don't send fileUrl or fileName if they're undefined
    });

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit = 50 } = req.query;

    // Verify access
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const messages = await Chat.getMessages(classId, parseInt(limit));
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { classId, messageId } = req.params;
    await Chat.markAsRead(classId, messageId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const { classId } = req.params;
    const count = await Chat.getUnreadCount(classId, req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

const setTyping = async (req, res) => {
  try {
    const { classId } = req.params;
    const { isTyping } = req.body;
    
    await Chat.setTyping(classId, req.user.id, req.user.name, isTyping);
    res.json({ success: true });
  } catch (error) {
    console.error('Set typing error:', error);
    res.status(500).json({ error: 'Failed to set typing status' });
  }
};

const getTypingUsers = async (req, res) => {
  try {
    const { classId } = req.params;
    const typingUsers = await Chat.getTypingUsers(classId);
    
    // Remove current user from the list
    const { [req.user.id]: _, ...others } = typingUsers || {};
    
    // Filter out old typing indicators (>5 seconds)
    const now = Date.now();
    const activeTyping = {};
    Object.entries(others || {}).forEach(([userId, data]) => {
      if (now - (data.timestamp || 0) < 5000) {
        activeTyping[userId] = data;
      }
    });
    
    res.json(activeTyping);
  } catch (error) {
    console.error('Get typing users error:', error);
    res.status(500).json({ error: 'Failed to get typing users' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { classId, messageId } = req.params;
    
    // Verify user owns the message or is teacher
    const snapshot = await db
      .ref(`chats/${classId}/messages/${messageId}`)
      .once('value');
    
    const message = snapshot.val();
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Chat.deleteMessage(classId, messageId);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// ✅ SINGLE module.exports at the END with ALL functions
module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
  setTyping,
  getTypingUsers,
  deleteMessage  // Now this works because it's defined above
};