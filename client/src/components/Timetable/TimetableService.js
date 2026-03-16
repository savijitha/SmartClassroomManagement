class TimetableService {
  constructor() {
    this.currentClass = null;
    this.nextClass = null;
    this.listeners = [];
    this.intervalId = null;
  }

  // Convert time string "09:30" to minutes since midnight
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get current time in minutes
  getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // Get current day
  getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  // Find current and next class from today's schedule
  detectCurrentAndNextClass(todaysClasses) {
    if (!todaysClasses || todaysClasses.length === 0) {
      return { current: null, next: null };
    }

    const now = this.getCurrentTimeInMinutes();
    
    // Sort classes by start time
    const sortedClasses = [...todaysClasses].sort((a, b) => 
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    let current = null;
    let next = null;

    for (let i = 0; i < sortedClasses.length; i++) {
      const cls = sortedClasses[i];
      const start = this.timeToMinutes(cls.startTime);
      const end = this.timeToMinutes(cls.endTime);

      // Check if current time is within this class period
      if (now >= start && now < end) {
        current = cls;
        next = i < sortedClasses.length - 1 ? sortedClasses[i + 1] : null;
        break;
      }

      // If we haven't found current class, track the next upcoming class
      if (now < start && !current) {
        current = null;
        next = cls;
        break;
      }
    }

    // If no current class and no next class found (all classes ended)
    if (!current && !next && sortedClasses.length > 0) {
      const lastClass = sortedClasses[sortedClasses.length - 1];
      const lastEnd = this.timeToMinutes(lastClass.endTime);
      
      if (now > lastEnd) {
        // All classes ended for today
        return { current: null, next: null, message: "All classes completed for today" };
      }
    }

    return { current, next };
  }

  // Start monitoring class times
  startMonitoring(todaysClasses, callbacks) {
    const { onClassStart, onClassEnd, onNextClassReminder } = callbacks;
    
    // Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Check every 30 seconds
    this.intervalId = setInterval(() => {
      const { current, next } = this.detectCurrentAndNextClass(todaysClasses);
      
      // Check if current class changed
      if (current?.id !== this.currentClass?.id) {
        if (current) {
          onClassStart?.(current);
        } else if (this.currentClass) {
          onClassEnd?.(this.currentClass);
        }
        this.currentClass = current;
      }

      // Check for next class reminder (5 minutes before)
      if (next && !this.nextClass) {
        const now = this.getCurrentTimeInMinutes();
        const nextStart = this.timeToMinutes(next.startTime);
        
        if (nextStart - now <= 5 && nextStart - now > 0) {
          onNextClassReminder?.(next);
        }
      }
      
      this.nextClass = next;

      // Notify all listeners
      this.listeners.forEach(listener => listener({ current, next }));
      
    }, 30000); // 30 seconds

    // Initial detection
    const { current, next } = this.detectCurrentAndNextClass(todaysClasses);
    this.currentClass = current;
    this.nextClass = next;
    
    return { current, next };
  }

  // Add listener for time updates
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default new TimetableService();