class NotificationService {
  constructor() {
    this.permission = 'default';
    this.listeners = {};
    this.notificationQueue = [];
    this.showingPermissionPrompt = false;
  }

  // Request notification permission on login
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return false;
    }

    // Show a custom permission prompt first
    this.showingPermissionPrompt = true;
    
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.showingPermissionPrompt = false;
      
      if (permission === 'granted') {
        this.showWelcomeNotification();
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.showingPermissionPrompt = false;
      return false;
    }
  }

  showWelcomeNotification() {
    if (this.permission === 'granted') {
      new Notification('🔔 Notifications Enabled', {
        body: 'You will now receive notifications for discussions and messages!',
        icon: '/notification-icon.png',
        badge: '/badge-icon.png'
      });
    }
  }

  // Show a browser notification
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      // Queue notification for when permission is granted
      this.notificationQueue.push({ title, options });
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/badge-icon.png',
        requireInteraction: true,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        if (options.onClick) options.onClick();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  // Show a custom in-app toast notification
  showToast(message, type = 'info', duration = 5000) {
    const event = new CustomEvent('app-toast', {
      detail: { message, type, duration }
    });
    window.dispatchEvent(event);
  }

  // Handle new notification from backend
  handleNewNotification(notification) {
    // Show browser notification
    if (this.permission === 'granted') {
      let title = '';
      let body = '';
      let icon = '';

      switch (notification.type) {
        case 'new_thread':
          title = '💬 New Discussion';
          body = `${notification.createdByName} started: "${notification.title}"`;
          icon = '💬';
          break;
        case 'new_comment':
          title = '💭 New Comment';
          body = `${notification.createdByName} commented on "${notification.threadTitle}"`;
          icon = '💭';
          break;
        case 'thread_resolved':
          title = '✅ Discussion Resolved';
          body = `${notification.createdByName} marked a discussion as resolved`;
          icon = '✅';
          break;
        default:
          title = '🔔 New Notification';
          body = notification.message;
      }

      this.showNotification(title, {
        body,
        tag: notification.id,
        data: notification,
        onClick: () => {
          if (notification.link) {
            window.location.href = notification.link;
          }
        }
      });
    }

    // Show in-app toast
    this.showToast(notification.message, 'info');

    // Emit event for components
    this.emit('notification', notification);
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  // Show permission prompt in UI
  getPermissionPrompt() {
    if (this.permission !== 'default' || this.showingPermissionPrompt) return null;

    return {
      message: 'Enable notifications to stay updated on discussions and messages?',
      onAccept: () => this.requestPermission(),
      onDecline: () => {
        this.permission = 'denied';
        this.showingPermissionPrompt = false;
      }
    };
  }
}

export default new NotificationService();