import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class NotificationManager {
  constructor() {
    this.notificationPermission = false;
    this.initNotifications();
  }

  // Initialize and request notification permission
  async initNotifications() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission === 'granted';
    }
  }

  // Show browser notification
  showBrowserNotification(title, options = {}) {
    if (!this.notificationPermission) return false;

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

  // Show toast notification
  showToast(message, type = 'info', options = {}) {
    const toastOptions = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch(type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      default:
        toast.info(message, toastOptions);
    }
  }

  // Class start notification
  showClassStartNotification(cls) {
    const message = `🔔 Your class "${cls.subject}" has started!`;
    
    // Toast notification
    this.showToast(message, 'info', {
      autoClose: 10000,
      onClick: () => {
        if (cls.meetingLink) window.open(cls.meetingLink, '_blank');
      }
    });

    // Browser notification
    this.showBrowserNotification('Class Started!', {
      body: `${cls.subject} with ${cls.teacher} has begun. Click to join.`,
      tag: `class-start-${cls.id}`,
      onClick: () => {
        if (cls.meetingLink) window.open(cls.meetingLink, '_blank');
      }
    });
  }

  // Join reminder notification
  showJoinReminder(cls) {
    const message = `⚠️ You haven't joined "${cls.subject}" yet. Click to join now!`;
    
    this.showToast(message, 'warning', {
      autoClose: 0, // Don't auto close
      onClick: () => {
        if (cls.meetingLink) window.open(cls.meetingLink, '_blank');
      }
    });

    this.showBrowserNotification('Join Your Class!', {
      body: `You haven't joined ${cls.subject}. Click to join now.`,
      tag: `join-reminder-${cls.id}`,
      requireInteraction: true,
      onClick: () => {
        if (cls.meetingLink) window.open(cls.meetingLink, '_blank');
      }
    });
  }

  // Next class reminder
  showNextClassReminder(cls) {
    const startTime = this.formatTime(cls.startTime);
    const message = `⏰ Next class: ${cls.subject} at ${startTime} with ${cls.teacher}`;
    
    this.showToast(message, 'info');
    
    this.showBrowserNotification('Upcoming Class', {
      body: `${cls.subject} starts at ${startTime}`,
      tag: `next-class-${cls.id}`
    });
  }

  // Class ended notification
  showClassEndNotification(cls) {
    const message = `✅ Class "${cls.subject}" has ended.`;
    this.showToast(message, 'success');
  }

  formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
}

export default new NotificationManager();