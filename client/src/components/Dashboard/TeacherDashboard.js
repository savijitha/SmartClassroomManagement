import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    todaysClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [showJoinCode, setShowJoinCode] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get classes
      const classesRes = await api.get('/classes');
      const classesData = classesRes.data || [];
      setClasses(classesData);
      
      // Calculate stats
      let totalStudents = 0;
      let pendingAssignments = 0;
      let todaysClasses = 0;
      
      const today = new Date().toLocaleDateString('en', { weekday: 'long' });
      
      for (const cls of classesData) {
        // Count students
        totalStudents += cls.students?.length || 0;
        
        // Get assignments for this class
        try {
          const assignmentsRes = await api.get(`/assignments/class/${cls.id}`);
          const assignments = assignmentsRes.data || [];
          
          // Count pending assignments (due in future)
          const now = new Date();
          const pending = assignments.filter(a => new Date(a.dueDate) > now);
          pendingAssignments += pending.length;
        } catch (err) {
          console.log(`No assignments for class ${cls.id}`);
        }
        
        // Check if class is today
        if (cls.schedule && cls.schedule.includes(today)) {
          todaysClasses++;
        }
      }
      
      setStats({
        totalClasses: classesData.length,
        totalStudents,
        pendingAssignments,
        todaysClasses
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setClasses([]);
      setStats({
        totalClasses: 0,
        totalStudents: 0,
        pendingAssignments: 0,
        todaysClasses: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Join link copied to clipboard!');
  };

  const generateJoinLink = (classId, className) => {
    return `${window.location.origin}/join-class/${classId}`;
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
            Here's what's happening with your classes today.
          </p>
        </div>
        <Link to="/classes/create" className="btn btn-primary">
          + Create New Class
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-number">{stats.totalClasses}</div>
          <div className="stat-label">Total Classes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">Enrolled Students</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{stats.pendingAssignments}</div>
          <div className="stat-label">Pending Assignments</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{stats.todaysClasses}</div>
          <div className="stat-label">Today's Classes</div>
        </div>
      </div>

      {/* Recent Classes */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-lg)'
        }}>
          <h2>Your Classes</h2>
          <Link to="/classes" className="btn btn-secondary">View All</Link>
        </div>

        <div className="classes-grid">
          {classes.length > 0 ? (
            classes.slice(0, 4).map(cls => (
              <div key={cls.id} className="class-card">
                <div className="class-header">
                  <h3 style={{ color: 'white', margin: 0 }}>{cls.name}</h3>
                  <span className="class-badge">{cls.students?.length || 0} students</span>
                </div>
                <div className="class-body">
                  <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-md)' }}>
                    {cls.description || 'No description'}
                  </p>
                  <div className="class-info">
                    <span>📅 {cls.schedule || 'Schedule not set'}</span>
                  </div>
                  
                  {/* Join Link Section */}
                  <div className="join-link-section" style={{
                    marginTop: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: 'var(--cream-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--maroon-primary)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <small style={{ color: 'var(--text-light)' }}>Share this link with students:</small>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.8rem',
                          color: 'var(--maroon-primary)',
                          wordBreak: 'break-all'
                        }}>
                          {generateJoinLink(cls.id, cls.name)}
                        </div>
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        onClick={() => copyToClipboard(generateJoinLink(cls.id, cls.name))}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <div style={{ marginTop: 'var(--space-xs)', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      Class ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{cls.id}</span>
                    </div>
                  </div>
                </div>
                <div className="class-footer">
                  <Link to={`/classes/${cls.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                  <Link 
                    to={`/attendance/mark/${cls.id}`} 
                    className="btn btn-primary"
                    style={{ padding: 'var(--space-xs) var(--space-md)' }}
                  >
                    Mark Attendance
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-xl)' }}>
              <p>You haven't created any classes yet.</p>
              <Link to="/classes/create" className="btn btn-primary">Create Your First Class</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        marginTop: 'var(--space-xl)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-lg)'
      }}>
        <div className="card">
          <div className="card-header">
            <h3>Recent Submissions</h3>
          </div>
          <div>
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No recent submissions
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Upcoming Tasks</h3>
          </div>
          <div>
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No upcoming tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;