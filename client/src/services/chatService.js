import api from './api';

class ChatService {
  constructor() {
    this.listeners = {};
    this.typingTimeouts = {};
    this.eventSource = null;
  }

  // Poll for new messages (simpler approach)
  startPolling(classId, callback, interval = 3000) {
    if (this.listeners[classId]) {
      clearInterval(this.listeners[classId]);
    }

    let lastMessageId = null;

    const poll = async () => {
      try {
        const response = await api.get(`/chat/${classId}/messages?limit=10`);
        const messages = response.data;
        
        if (messages.length > 0) {
          const latestMessage = messages[messages.length - 1];
          if (latestMessage.id !== lastMessageId) {
            lastMessageId = latestMessage.id;
            callback('new', latestMessage);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll
    poll();
    
    // Start polling
    this.listeners[classId] = setInterval(poll, interval);
    
    return () => this.stopPolling(classId);
  }

  stopPolling(classId) {
    if (this.listeners[classId]) {
      clearInterval(this.listeners[classId]);
      delete this.listeners[classId];
    }
  }

  // Send typing indicator
  async sendTyping(classId, isTyping) {
    try {
      await api.post(`/chat/${classId}/typing`, { isTyping });
    } catch (error) {
      console.error('Failed to send typing status:', error);
    }
  }

  // Poll for typing indicators
  startTypingPolling(classId, callback, interval = 2000) {
    if (this.typingTimeouts[classId]) {
      clearInterval(this.typingTimeouts[classId]);
    }

    const poll = async () => {
      try {
        // You'll need to add this endpoint
        const response = await api.get(`/chat/${classId}/typing`);
        callback(response.data);
      } catch (error) {
        console.error('Typing polling error:', error);
      }
    };

    this.typingTimeouts[classId] = setInterval(poll, interval);
    
    return () => clearInterval(this.typingTimeouts[classId]);
  }

  // Mark message as read
  async markAsRead(classId, messageId) {
    try {
      await api.post(`/chat/${classId}/messages/${messageId}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  // Clean up all listeners
  removeListeners(classId) {
    this.stopPolling(classId);
    if (this.typingTimeouts[classId]) {
      clearInterval(this.typingTimeouts[classId]);
      delete this.typingTimeouts[classId];
    }
  }
}

export default new ChatService();