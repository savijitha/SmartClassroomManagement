import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AttendanceView = () => {
  const { isTeacher, user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      console.log('Fetching attendance for:', { classId: selectedClass, date: selectedDate });
      
      const response = await api.get(`/attendance/class/${selectedClass}/date/${selectedDate}`);
      console.log('Attendance data received:', response.data);
      
      setAttendance(response.data);
      
      // Calculate stats from the actual attendance data
      const stats = response.data.reduce((acc, record) => {
        if (record.status === 'present') acc.present += 1;
        else if (record.status === 'absent') acc.absent += 1;
        else if (record.status === 'late') acc.late += 1;
        acc.total += 1;
        return acc;
      }, { present: 0, absent: 0, late: 0, total: 0 });
      
      console.log('Calculated stats:', stats);
      setStats(stats);
      
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setAttendance([]);
      setStats({ present: 0, absent: 0, late: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'present': return 'status-present';
      case 'absent': return 'status-absent';
      case 'late': return 'status-late';
      default: return '';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Attendance</h1>
          <p style={{ color: 'var(--text-light)' }}>
            Track and manage student attendance
          </p>
        </div>
        {isTeacher && selectedClass && (
          <Link 
            to={`/attendance/mark/${selectedClass}`}
            className="btn btn-primary"
            state={{ date: selectedDate }}
          >
            Mark Today's Attendance
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          <div className="form-group">
            <label className="form-label">Select Class</label>
            <select 
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary - Now shows actual data */}
      {selectedClass && (
        <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats.present}</div>
            <div className="stat-label">Present</div>
            {stats.total > 0 && (
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: 'var(--cream-dark)',
                marginTop: 'var(--space-sm)',
                borderRadius: '2px'
              }}>
                <div style={{ 
                  width: `${(stats.present/stats.total)*100}%`, 
                  height: '100%', 
                  background: 'var(--success)',
                  borderRadius: '2px'
                }} />
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-number">{stats.late}</div>
            <div className="stat-label">Late</div>
            {stats.total > 0 && (
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: 'var(--cream-dark)',
                marginTop: 'var(--space-sm)',
                borderRadius: '2px'
              }}>
                <div style={{ 
                  width: `${(stats.late/stats.total)*100}%`, 
                  height: '100%', 
                  background: 'var(--warning)',
                  borderRadius: '2px'
                }} />
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-number">{stats.absent}</div>
            <div className="stat-label">Absent</div>
            {stats.total > 0 && (
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: 'var(--cream-dark)',
                marginTop: 'var(--space-sm)',
                borderRadius: '2px'
              }}>
                <div style={{ 
                  width: `${(stats.absent/stats.total)*100}%`, 
                  height: '100%', 
                  background: 'var(--error)',
                  borderRadius: '2px'
                }} />
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-number">
              {stats.total ? Math.round((stats.present/stats.total)*100) : 0}%
            </div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {selectedClass && (
        <div className="card">
          <h3>Attendance Records - {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h3>

          {loading ? (
            <div className="loading-spinner" style={{ margin: 'var(--space-xl) auto' }}></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Time</th>
                    {isTeacher && <th>Marked By</th>}
                  </tr>
                </thead>
                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map(record => (
                      <tr key={record.id}>
                        <td>{record.studentName || 'Unknown Student'}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                            {record.status?.toUpperCase()}
                          </span>
                        </td>
                        <td>{record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : '-'}</td>
                        {isTeacher && <td>{record.markedByName || 'Unknown'}</td>}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isTeacher ? "4" : "3"} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>📋</div>
                        <p style={{ color: 'var(--text-light)' }}>No attendance records found for this date</p>
                        {isTeacher && (
                          <Link 
                            to={`/attendance/mark/${selectedClass}`}
                            className="btn btn-primary"
                            state={{ date: selectedDate }}
                          >
                            Mark Attendance
                          </Link>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceView;