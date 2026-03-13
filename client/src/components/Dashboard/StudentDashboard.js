import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  try {
    // Fetch classes
    const classesRes = await api.get('/classes');
    const classesData = classesRes.data || [];
    setClasses(classesData);
    
    // Fetch assignments for each class
    let allAssignments = [];
    
    // Fetch attendance for student
    let attendanceRecords = [];
    try {
      const attendanceRes = await api.get('/attendance/my-attendance');
      attendanceRecords = attendanceRes.data || [];
      console.log('Attendance records:', attendanceRecords); // Debug log
    } catch (err) {
      console.log('No attendance data yet');
    }

    // Calculate attendance stats
    let totalClasses = 0;
    let presentCount = 0;
    
    // Group attendance by class and date to avoid counting multiple times
    const uniqueAttendance = new Set();
    
    attendanceRecords.forEach(record => {
      // Create unique key for each class+date combination
      const key = `${record.classId}_${record.date}`;
      if (!uniqueAttendance.has(key)) {
        uniqueAttendance.add(key);
        totalClasses++;
        if (record.status === 'present') {
          presentCount++;
        }
      }
    });

    console.log('Present count:', presentCount, 'Total classes:', totalClasses); // Debug log

    // Calculate attendance percentage
    const attendancePct = totalClasses > 0 
      ? Math.round((presentCount / totalClasses) * 100) 
      : 0;
      
    setAttendanceStats({ 
      present: attendancePct, 
      total: totalClasses,
      presentCount: presentCount
    });
    
    // Fetch assignments
    for (const cls of classesData) {
      try {
        const assignmentsRes = await api.get(`/assignments/class/${cls.id}`);
        const classAssignments = assignmentsRes.data || [];
        
        const now = new Date();
        const upcoming = classAssignments.filter(a => {
          const dueDate = new Date(a.dueDate);
          return dueDate > now;
        });
        
        const assignmentsWithClass = upcoming.map(a => ({
          ...a,
          className: cls.name
        }));
        
        allAssignments = [...allAssignments, ...assignmentsWithClass];
      } catch (err) {
        console.log(`No assignments for class ${cls.id}`);
      }
    }
    
    setAssignments(allAssignments);
    
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    setClasses([]);
    setAssignments([]);
  } finally {
    setLoading(false);
  }
};
      
  const handleJoinClass = async (e) => {
  e.preventDefault();
  setJoinError('');
  setJoinSuccess('');

  // Extract ID from URL or use directly
  let classId = joinCode.trim();
  
  if (classId.includes('join-class/')) {
    const matches = classId.match(/join-class\/([^\/\s]+)/);
    if (matches && matches[1]) {
      classId = matches[1];
    }
  }

  if (!classId) {
    setJoinError('Please enter a valid class ID or link');
    return;
  }

  try {
    // Send the student ID in the request body
    await api.post(`/classes/${classId}/enroll`, { 
      studentId: user.id  // Send the current user's ID
    });
    
    setJoinSuccess(`Successfully joined the class!`);
    setJoinCode('');
    setShowJoinModal(false);
    fetchDashboardData();
    
  } catch (error) {
    console.error('Join class error:', error);
    if (error.response?.status === 404) {
      setJoinError('Class not found. Please check the ID or link.');
    } else if (error.response?.status === 400) {
      setJoinError(error.response.data?.error || 'You are already in this class');
    } else {
      setJoinError(error.response?.data?.error || 'Failed to join class');
    }
  }
};

  // Calculate GPA (mock for now)
  const calculateGPA = () => {
    return (Math.random() * 1.5 + 2.5).toFixed(2);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}!</h1>
          <p style={{ color: 'var(--text-light)' }}>
            Track your classes and assignments.
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowJoinModal(true)}
        >
          + Join Class
        </button>
      </div>

      {/* Stats Grid */}
      {/* Stats Grid */}
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-icon">📚</div>
    <div className="stat-number">{classes.length}</div>
    <div className="stat-label">Enrolled Classes</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-icon">📝</div>
    <div className="stat-number">{assignments.length}</div>
    <div className="stat-label">Pending Assignments</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-icon">✅</div>
    <div className="stat-number">{attendanceStats.present}%</div>
    <div className="stat-label">Attendance Rate</div>
    <div style={{ 
      width: '100%', 
      height: '4px', 
      background: 'var(--cream-dark)',
      marginTop: 'var(--space-sm)',
      borderRadius: '2px'
    }}>
      <div style={{ 
        width: `${attendanceStats.present}%`, 
        height: '100%', 
        background: 'var(--success)',
        borderRadius: '2px'
      }} />
    </div>
    <small style={{ color: 'var(--text-light)', marginTop: 'var(--space-xs)' }}>
      {attendanceStats.presentCount || 0} present out of {attendanceStats.total || 0} days
    </small>
  </div>
  
  <div className="stat-card">
    <div className="stat-icon">📊</div>
    <div className="stat-number">{calculateGPA()}</div>
    <div className="stat-label">Current GPA</div>
  </div>
</div>

      {/* My Classes */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <h2>My Classes</h2>
          <Link to="/classes" className="btn btn-secondary">View All</Link>
        </div>

        <div className="classes-grid">
          {classes.length > 0 ? (
            classes.slice(0, 4).map(cls => (
              <div key={cls.id} className="class-card">
                <div className="class-header">
                  <h3 style={{ color: 'white', margin: 0 }}>{cls.name}</h3>
                  <span className="class-badge">{cls.teacherName || 'Teacher'}</span>
                </div>
                <div className="class-body">
                  <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-md)' }}>
                    {cls.description || 'No description available'}
                  </p>
                  <div className="class-info">
                    <span>📅 {cls.schedule || 'Schedule not set'}</span>
                  </div>
                </div>
                <div className="class-footer">
                  <Link to={`/classes/${cls.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  <Link 
                    to={`/assignments?class=${cls.id}`} 
                    className="btn btn-primary"
                    style={{ padding: 'var(--space-xs) var(--space-md)' }}
                  >
                    View Assignments
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-xl)' }}>
              <p>You are not enrolled in any classes yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowJoinModal(true)}
              >
                Join a Class
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <h2>Upcoming Assignments</h2>
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          {assignments.length > 0 ? (
            assignments.slice(0, 5).map(assignment => (
              <div key={assignment.id} className="assignment-item">
                <div>
                  <h4 style={{ marginBottom: 'var(--space-xs)' }}>{assignment.title}</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {assignment.className} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <Link 
                  to={`/assignments/${assignment.id}/submit`}
                  className="btn btn-outline"
                  style={{ padding: 'var(--space-xs) var(--space-md)' }}
                >
                  Submit
                </Link>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No upcoming assignments
            </p>
          )}
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Join a Class</h3>
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-lg)' }}>
                Enter the class ID or share link provided by your teacher
              </p>

              {joinSuccess && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-lg)' }}>
                  {joinSuccess}
                </div>
              )}

              {joinError && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
                  {joinError}
                </div>
              )}

              <form onSubmit={handleJoinClass}>
                <div className="form-group">
                  <label className="form-label">Class ID or Link</label>
                  <input
                    type="text"
                    className="form-control"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g., abc123 or https://.../join-class/abc123"
                    autoFocus
                  />
                </div>

                <div style={{ 
                  background: 'var(--cream-primary)', 
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-lg)'
                }}>
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>
                    <strong>How to find your class ID:</strong> The teacher can share a link or the class ID directly. 
                    The ID is the part after /classes/ in the class URL.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Join Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;