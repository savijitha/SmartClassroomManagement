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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Change fetchDashboardData to this:
const fetchDashboardData = async () => {
  try {
    // Just get classes, calculate stats manually
    const classesRes = await api.get('/classes');
    const classesData = classesRes.data || [];
    setClasses(classesData);
    
    // Calculate stats manually
    let totalStudents = 0;
    let todaysClasses = 0;
    const today = new Date().toLocaleDateString('en', { weekday: 'long' });
    
    classesData.forEach(cls => {
      totalStudents += cls.students?.length || 0;
      if (cls.schedule && cls.schedule.includes(today)) {
        todaysClasses++;
      }
    });
    
    setStats({
      totalClasses: classesData.length,
      totalStudents,
      pendingAssignments: 0, // Will be calculated after assignments load
      todaysClasses
    });
    
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    setLoading(false);
  }
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
          {classes.slice(0, 4).map(cls => (
            <div key={cls.id} className="class-card">
              <div className="class-header">
                <h3 style={{ color: 'white', margin: 0 }}>{cls.name}</h3>
                <span className="class-badge">{cls.students?.length || 0} students</span>
              </div>
              <div className="class-body">
                <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-md)' }}>
                  {cls.description}
                </p>
                <div className="class-info">
                  <span>📅 {cls.schedule}</span>
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
          ))}
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