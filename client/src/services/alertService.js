import api from './api';

class AlertService {
  constructor() {
    this.schedules = [];
    this.intervalId = null;
    this.notificationPermission = false;
  }

  // Request notification permission
  async requestPermission() {
    if (!("Notification" in window)) {
      console.log("Browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      this.notificationPermission = true;
      return true;
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission = permission === "granted";
    return this.notificationPermission;
  }

  // Play alert sound
  playAlertSound() {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.5;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio play failed:', error);
    }
  }

  // Send notification
  sendNotification(title, body, className) {
    if (this.notificationPermission) {
      new Notification(title, {
        body,
        icon: '/notification-icon.png',
        badge: '/badge-icon.png',
        tag: 'class-alert',
        requireInteraction: true
      });

      this.playAlertSound();
    }
  }

  // Check for upcoming classes
  checkUpcomingClasses(schedules) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en', { weekday: 'long' });
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    schedules.forEach(schedule => {
      // Check if class is scheduled today
      if (schedule.days && schedule.days.includes(currentDay)) {
        const [classHour, classMinute] = schedule.startTime.split(':');
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);

        const classTimeInMinutes = parseInt(classHour) * 60 + parseInt(classMinute);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const minutesUntilClass = classTimeInMinutes - currentTimeInMinutes;

        // Check if it's time to alert
        if (minutesUntilClass > 0 && minutesUntilClass <= schedule.alertBefore) {
          // Check if already alerted recently
          const lastAlerted = schedule.lastAlerted ? new Date(schedule.lastAlerted) : null;
          const nowTime = new Date().getTime();

          if (!lastAlerted || (nowTime - lastAlerted.getTime() > 5 * 60 * 1000)) {
            this.sendNotification(
              `🔔 Class Starting Soon!`,
              `${schedule.className} begins in ${minutesUntilClass} minutes in ${schedule.room || 'Room TBD'}`,
              schedule.className
            );

            // Update last alerted timestamp via API
            this.updateLastAlerted(schedule.id);
          }
        }
      }
    });
  }

  // Update last alerted timestamp
  async updateLastAlerted(scheduleId) {
    try {
      await api.put(`/schedules/${scheduleId}`, {
        lastAlerted: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update last alerted:', error);
    }
  }

  // Start monitoring
  startMonitoring(schedules) {
    this.schedules = schedules;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Check every minute
    this.intervalId = setInterval(() => {
      this.checkUpcomingClasses(this.schedules);
    }, 60000); // 60000 ms = 1 minute

    // Initial check
    this.checkUpcomingClasses(this.schedules);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default new AlertService();