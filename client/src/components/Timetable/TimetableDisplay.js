import React, { useState, useEffect } from 'react';
import { getClassTimetable } from '../../services/firestoreService';
import timetableService from './TimetableService';

const TimetableDisplay = ({ classId, className }) => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentClassId, setCurrentClassId] = useState(null);
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTimetable();
  }, [classId]);

  useEffect(() => {
    // Listen for current class updates
    const unsubscribe = timetableService.addListener(({ current }) => {
      setCurrentClassId(current?.id);
    });

    return unsubscribe;
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await getClassTimetable(classId);
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (entry) => {
    if (entry.id === currentClassId) return 'current';
    
    const now = timetableService.getCurrentTimeInMinutes();
    const entryStart = timetableService.timeToMinutes(entry.startTime);
    const entryEnd = timetableService.timeToMinutes(entry.endTime);
    
    if (now > entryEnd) return 'completed';
    if (now < entryStart) return 'upcoming';
    return '';
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="timetable-display card">
      <h2>{className} - Weekly Timetable</h2>
      
      <div className="timetable-grid">
        {daysOrder.map(day => (
          <div key={day} className="day-column">
            <h3 className="day-header">{day}</h3>
            
            {timetable[day]?.length > 0 ? (
              <div className="class-list">
                {timetable[day].map((entry, index) => {
                  const status = getStatusClass(entry);
                  return (
                    <div 
                      key={index} 
                      className={`class-entry ${status}`}
                    >
                      <div className="time-badge">
                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      </div>
                      <div className="subject">{entry.subject}</div>
                      <div className="teacher">{entry.teacher}</div>
                      {status === 'current' && (
                        <span className="live-badge">🔴 LIVE</span>
                      )}
                      {entry.meetingLink && (
                        <a 
                          href={entry.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="meeting-link"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-class">No classes</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .timetable-display {
          padding: var(--space-xl);
        }

        .timetable-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--space-md);
          margin-top: var(--space-xl);
          overflow-x: auto;
        }

        .day-column {
          min-width: 150px;
        }

        .day-header {
          text-align: center;
          padding: var(--space-sm);
          background: var(--maroon-primary);
          color: white;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
        }

        .class-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .class-entry {
          padding: var(--space-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          position: relative;
          transition: all 0.2s;
        }

        .class-entry.current {
          background: rgba(128, 0, 0, 0.1);
          border: 2px solid var(--maroon-primary);
          animation: pulse 2s infinite;
        }

        .class-entry.completed {
          opacity: 0.6;
          background: var(--cream-dark);
        }

        .class-entry.upcoming {
          border-left: 3px solid var(--info);
        }

        .time-badge {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 4px;
        }

        .subject {
          font-weight: 600;
          color: var(--text-dark);
        }

        .teacher {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .live-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 0.7rem;
          background: var(--error);
          color: white;
          padding: 2px 4px;
          border-radius: 4px;
        }

        .meeting-link {
          display: inline-block;
          margin-top: 4px;
          font-size: 0.8rem;
          color: var(--maroon-primary);
          text-decoration: none;
        }

        .meeting-link:hover {
          text-decoration: underline;
        }

        .no-class {
          text-align: center;
          color: var(--text-light);
          padding: var(--space-md);
          background: var(--cream-primary);
          border-radius: var(--radius-md);
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(128, 0, 0, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(128, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(128, 0, 0, 0); }
        }

        @media (max-width: 768px) {
          .timetable-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TimetableDisplay;