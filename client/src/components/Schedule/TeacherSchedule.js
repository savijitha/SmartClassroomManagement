import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import alertService from '../../services/alertService';

const TeacherSchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    classId: '',
    startTime: '',
    endTime: '',
    days: [],
    room: '',
    alertBefore: 5
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    fetchData();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (schedules.length > 0) {
      alertService.startMonitoring(schedules);
    }

    return () => {
      alertService.stopMonitoring();
    };
  }, [schedules]);

  const requestNotificationPermission = async () => {
    const granted = await alertService.requestPermission();
    if (granted) {
      console.log('Notification permission granted');
    }
  };

  const fetchData = async () => {
    try {
      const [classesRes, schedulesRes] = await Promise.all([
        api.get('/classes'),
        api.get('/schedules')
      ]);
      setClasses(classesRes.data);
      setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', formData);
      setShowAddModal(false);
      fetchData();
      setFormData({
        classId: '',
        startTime: '',
        endTime: '',
        days: [],
        room: '',
        alertBefore: 5
      });
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const getScheduleStatus = (schedule) => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en', { weekday: 'long' });
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (!schedule.days.includes(currentDay)) return 'not-today';

    const [startHour, startMin] = schedule.startTime.split(':');
    const [endHour, endMin] = schedule.endTime.split(':');
    
    const startMinutes = parseInt(startHour) * 60 + parseInt(startMin);
    const endMinutes = parseInt(endHour) * 60 + parseInt(endMin);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes < startMinutes) return 'upcoming';
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return 'ongoing';
    return 'completed';
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Teaching Schedule</h1>
          <p style={{ color: 'var(--text-light)' }}>
            Set up alerts for your upcoming classes
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Schedule
        </button>
      </div>

      {/* Alert Preview */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span style={{ fontSize: '2rem' }}>🔔</span>
          <div>
            <h3>Alerts Active</h3>
            <p style={{ color: 'var(--text-light)' }}>
              You'll receive notifications {schedules.length > 0 
                ? `for ${schedules.length} scheduled classes` 
                : 'when you add schedules'}
            </p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="schedules-grid">
        {schedules.map(schedule => {
          const status = getScheduleStatus(schedule);
          return (
            <div key={schedule.id} className="card schedule-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{schedule.className}</h3>
                <span className={`status-badge status-${status}`}>
                  {status === 'upcoming' && '⏰ Upcoming'}
                  {status === 'ongoing' && '🟢 Ongoing'}
                  {status === 'completed' && '✅ Completed'}
                  {status === 'not-today' && '📅 Not Today'}
                </span>
              </div>

              <div style={{ marginTop: 'var(--space-md)' }}>
                <p><strong>Time:</strong> {schedule.startTime} - {schedule.endTime}</p>
                <p><strong>Days:</strong> {schedule.days.join(', ')}</p>
                <p><strong>Room:</strong> {schedule.room || 'Not set'}</p>
                <p><strong>Alert:</strong> {schedule.alertBefore} minutes before</p>
              </div>
            </div>
          );
        })}

        {schedules.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>⏰</div>
            <h3>No Schedules Yet</h3>
            <p style={{ color: 'var(--text-light)' }}>
              Add your class schedules to receive alerts
            </p>
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Class Schedule</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Class</label>
                <select
                  className="form-control"
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  required
                >
                  <option value="">Choose a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Days of Week</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  {daysOfWeek.map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Room/Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="e.g., Room 204"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alert Before (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.alertBefore}
                  onChange={(e) => setFormData({...formData, alertBefore: parseInt(e.target.value)})}
                  min="1"
                  max="30"
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .status-upcoming {
          background: var(--info);
          color: white;
        }
        .status-ongoing {
          background: var(--success);
          color: white;
        }
        .status-completed {
          background: var(--text-light);
          color: white;
        }
        .status-not-today {
          background: var(--cream-dark);
          color: var(--text-medium);
        }
        .schedule-card {
          transition: transform 0.2s;
        }
        .schedule-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
};

export default TeacherSchedule;