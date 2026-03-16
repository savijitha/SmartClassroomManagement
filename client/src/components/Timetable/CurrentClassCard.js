import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import timetableService from './TimetableService';
import notificationManager from '../Notifications/NotificationManager';

const CurrentClassCard = ({ classId, className, todaysClasses }) => {
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinTimeout, setJoinTimeout] = useState(null);

  useEffect(() => {
    // Start monitoring class times
    const { current, next } = timetableService.startMonitoring(todaysClasses, {
      onClassStart: (cls) => {
        notificationManager.showClassStartNotification(cls);
        setHasJoined(false);
        
        // Set timeout to check if student joined within 5 minutes
        const timeout = setTimeout(() => {
          if (!hasJoined) {
            notificationManager.showJoinReminder(cls);
          }
        }, 5 * 60 * 1000); // 5 minutes
        
        setJoinTimeout(timeout);
      },
      onClassEnd: (cls) => {
        notificationManager.showClassEndNotification(cls);
        if (joinTimeout) {
          clearTimeout(joinTimeout);
        }
      },
      onNextClassReminder: (cls) => {
        notificationManager.showNextClassReminder(cls);
      }
    });

    setCurrentClass(current);
    setNextClass(next);

    // Listen for time updates
    const unsubscribe = timetableService.addListener(({ current, next }) => {
      setCurrentClass(current);
      setNextClass(next);
    });

    return () => {
      timetableService.stopMonitoring();
      unsubscribe();
      if (joinTimeout) {
        clearTimeout(joinTimeout);
      }
    };
  }, [todaysClasses]);

  const handleJoinClass = () => {
    if (currentClass?.meetingLink) {
      window.open(currentClass.meetingLink, '_blank');
      setHasJoined(true);
      
      // Mark attendance (optional - can be sent to backend)
      toast.success('You have joined the class!');
      
      // TODO: Send join event to backend for attendance tracking
    }
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!currentClass && !nextClass) {
    return (
      <div className="current-class-card card">
        <div className="no-class">
          <span className="icon">📅</span>
          <h3>No classes scheduled today</h3>
          <p className="text-light">Enjoy your day off!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="current-class-card card">
      {currentClass ? (
        <div className="current-class">
          <div className="class-badge current">🔴 LIVE NOW</div>
          <h3>Current Class</h3>
          <div className="class-details">
            <h4>{currentClass.subject}</h4>
            <p className="teacher">👨‍🏫 {currentClass.teacher}</p>
            <p className="time">⏰ {formatTime(currentClass.startTime)} - {formatTime(currentClass.endTime)}</p>
          </div>
          
          {currentClass.meetingLink && (
            <button 
              className="btn btn-primary join-btn"
              onClick={handleJoinClass}
              disabled={hasJoined}
            >
              {hasJoined ? '✅ Joined' : '🔗 Join Class'}
            </button>
          )}
        </div>
      ) : (
        <div className="no-current-class">
          <span className="icon">⏳</span>
          <p>No ongoing class</p>
        </div>
      )}

      {nextClass && (
        <div className="next-class">
          <div className="class-badge next">⏰ NEXT</div>
          <h4>{nextClass.subject}</h4>
          <p className="teacher">{nextClass.teacher}</p>
          <p className="time">{formatTime(nextClass.startTime)} - {formatTime(nextClass.endTime)}</p>
        </div>
      )}

      <style jsx>{`
        .current-class-card {
          padding: var(--space-lg);
          max-width: 400px;
        }

        .class-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: var(--space-sm);
        }

        .class-badge.current {
          background: var(--error);
          color: white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }

        .class-badge.next {
          background: var(--info);
          color: white;
        }

        .current-class {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .class-details {
          margin: var(--space-md) 0;
        }

        .class-details h4 {
          font-size: 1.3rem;
          margin-bottom: var(--space-xs);
        }

        .teacher, .time {
          color: var(--text-light);
          margin: 4px 0;
        }

        .join-btn {
          width: 100%;
          margin-top: var(--space-md);
          font-size: 1.1rem;
          padding: var(--space-md);
        }

        .next-class {
          opacity: 0.8;
        }

        .next-class h4 {
          margin: var(--space-xs) 0;
        }

        .no-class {
          text-align: center;
          padding: var(--space-lg);
        }

        .no-class .icon {
          font-size: 3rem;
          display: block;
          margin-bottom: var(--space-md);
        }

        .no-current-class {
          text-align: center;
          color: var(--text-light);
          padding: var(--space-md);
        }

        .no-current-class .icon {
          font-size: 2rem;
          display: block;
          margin-bottom: var(--space-xs);
        }
      `}</style>
    </div>
  );
};

export default CurrentClassCard;