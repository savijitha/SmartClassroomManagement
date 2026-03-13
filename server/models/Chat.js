const { db } = require('../config/firebase');

class Chat {
  constructor(data) {
    this.id = data.id;
    this.classId = data.classId;
    this.message = data.message;
    this.senderId = data.senderId;
    this.senderName = data.senderName;
    this.senderRole = data.senderRole;
    this.timestamp = data.timestamp || Date.now();
    this.readBy = data.readBy || {};
    this.isDeleted = data.isDeleted || false;
    this.messageType = data.messageType || 'text';
    this.fileUrl = data.fileUrl || null;
    this.fileName = data.fileName || null;
  }

  static async send(classId, messageData) {
    try {
      const ref = db.ref(`chats/${classId}/messages`).push();
      const id = ref.key;
      
      // ✅ Clean the data - remove undefined values
      const cleanData = {};
      
      // Only add properties that have values
      if (messageData.message !== undefined) cleanData.message = messageData.message;
      if (messageData.senderId !== undefined) cleanData.senderId = messageData.senderId;
      if (messageData.senderName !== undefined) cleanData.senderName = messageData.senderName;
      if (messageData.senderRole !== undefined) cleanData.senderRole = messageData.senderRole;
      if (messageData.messageType !== undefined) cleanData.messageType = messageData.messageType;
      
      // Handle file fields - only add if they exist
      if (messageData.fileUrl) cleanData.fileUrl = messageData.fileUrl;
      if (messageData.fileName) cleanData.fileName = messageData.fileName;
      
      const message = {
        id,
        classId,
        ...cleanData,
        timestamp: Date.now(),
        readBy: { [messageData.senderId]: true }
      };
      
      await ref.set(message);
      
      // Update last message in class metadata
      const lastMessage = messageData.message || '';
      await db.ref(`chats/${classId}/metadata`).update({
        lastMessage: lastMessage.substring(0, 50),
        lastMessageTime: Date.now(),
        lastSender: messageData.senderName || 'Unknown'
      });
      
      return new Chat(message);
    } catch (error) {
      console.error('Error in Chat.send:', error);
      throw error;
    }
  }

  static async getMessages(classId, limit = 50) {
    try {
      const snapshot = await db.ref(`chats/${classId}/messages`)
        .orderByChild('timestamp')
        .limitToLast(limit)
        .once('value');
      
      const messages = snapshot.val();
      if (!messages) return [];
      
      return Object.keys(messages)
        .map(id => new Chat({ id, ...messages[id] }))
        .sort((a, b) => a.timestamp - b.timestamp); // Sort chronologically
    } catch (error) {
      console.error('Error in Chat.getMessages:', error);
      throw error;
    }
  }

  static async markAsRead(classId, messageId, userId) {
    try {
      await db.ref(`chats/${classId}/messages/${messageId}/readBy/${userId}`).set(true);
    } catch (error) {
      console.error('Error in Chat.markAsRead:', error);
      throw error;
    }
  }

  static async getUnreadCount(classId, userId) {
    try {
      const snapshot = await db.ref(`chats/${classId}/messages`).once('value');
      
      const messages = snapshot.val();
      if (!messages) return 0;
      
      return Object.values(messages).filter(msg => 
        !msg.readBy || !msg.readBy[userId]
      ).length;
    } catch (error) {
      console.error('Error in Chat.getUnreadCount:', error);
      throw error;
    }
  }

  static async setTyping(classId, userId, userName, isTyping) {
    try {
      const ref = db.ref(`chats/${classId}/typing/${userId}`);
      if (isTyping) {
        await ref.set({
          name: userName,
          timestamp: Date.now()
        });
      } else {
        await ref.remove();
      }
    } catch (error) {
      console.error('Error in Chat.setTyping:', error);
      throw error;
    }
  }

  static async getTypingUsers(classId) {
    try {
      const snapshot = await db.ref(`chats/${classId}/typing`).once('value');
      return snapshot.val() || {};
    } catch (error) {
      console.error('Error in Chat.getTypingUsers:', error);
      return {};
    }
  }

  static async deleteMessage(classId, messageId) {
    try {
      await db.ref(`chats/${classId}/messages/${messageId}`).update({
        isDeleted: true,
        message: '[This message has been deleted]'
      });
    } catch (error) {
      console.error('Error in Chat.deleteMessage:', error);
      throw error;
    }
  }
}

module.exports = Chat;