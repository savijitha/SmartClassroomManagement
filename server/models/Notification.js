const { db } = require('../config/firebase');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.type = data.type; // 'new_thread', 'new_comment', 'thread_resolved', 'mention'
    this.title = data.title;
    this.message = data.message;
    this.classId = data.classId;
    this.className = data.className;
    this.threadId = data.threadId;
    this.threadTitle = data.threadTitle;
    this.commentId = data.commentId;
    this.createdBy = data.createdBy;
    this.createdByName = data.createdByName;
    this.timestamp = data.timestamp || Date.now();
    this.isRead = data.isRead || false;
    this.isClicked = data.isClicked || false;
    this.icon = data.icon || '💬';
    this.link = data.link || '';
  }

  static async create(notificationData) {
    try {
      const ref = db.ref('notifications').push();
      const id = ref.key;
      
      const notification = {
        id,
        ...notificationData,
        timestamp: Date.now(),
        isRead: false,
        isClicked: false
      };
      
      await ref.set(notification);
      return new Notification(notification);
    } catch (error) {
      console.error('Error in Notification.create:', error);
      throw error;
    }
  }

  static async createForMultipleUsers(userIds, notificationData) {
    try {
      const promises = userIds.map(userId => {
        const ref = db.ref('notifications').push();
        const id = ref.key;
        
        const notification = {
          id,
          userId,
          ...notificationData,
          timestamp: Date.now(),
          isRead: false,
          isClicked: false
        };
        
        return ref.set(notification);
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error in Notification.createForMultipleUsers:', error);
      throw error;
    }
  }

  static async getForUser(userId, limit = 50) {
    try {
      const snapshot = await db.ref('notifications')
        .orderByChild('userId')
        .equalTo(userId)
        .limitToLast(limit)
        .once('value');
      
      const notifications = snapshot.val();
      if (!notifications) return [];
      
      return Object.keys(notifications)
        .map(id => new Notification({ id, ...notifications[id] }))
        .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
    } catch (error) {
      console.error('Error in Notification.getForUser:', error);
      return [];
    }
  }

  static async getUnreadCount(userId) {
    try {
      const snapshot = await db.ref('notifications')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const notifications = snapshot.val();
      if (!notifications) return 0;
      
      return Object.values(notifications).filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error in Notification.getUnreadCount:', error);
      return 0;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      await db.ref(`notifications/${notificationId}`).update({
        isRead: true
      });
    } catch (error) {
      console.error('Error in Notification.markAsRead:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const snapshot = await db.ref('notifications')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
      
      const notifications = snapshot.val();
      if (!notifications) return;
      
      const promises = Object.keys(notifications).map(id => {
        if (!notifications[id].isRead) {
          return db.ref(`notifications/${id}`).update({ isRead: true });
        }
      });
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error in Notification.markAllAsRead:', error);
      throw error;
    }
  }

  static async markAsClicked(notificationId) {
    try {
      await db.ref(`notifications/${notificationId}`).update({
        isClicked: true
      });
    } catch (error) {
      console.error('Error in Notification.markAsClicked:', error);
      throw error;
    }
  }

  static async deleteOldNotifications(daysOld = 30) {
    try {
      const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      
      const snapshot = await db.ref('notifications')
        .orderByChild('timestamp')
        .endAt(cutoffTime)
        .once('value');
      
      const oldNotifications = snapshot.val();
      if (!oldNotifications) return;
      
      const promises = Object.keys(oldNotifications).map(id => {
        return db.ref(`notifications/${id}`).remove();
      });
      
      await Promise.all(promises);
      console.log(`Deleted ${Object.keys(oldNotifications).length} old notifications`);
    } catch (error) {
      console.error('Error in Notification.deleteOldNotifications:', error);
    }
  }
}

module.exports = Notification;