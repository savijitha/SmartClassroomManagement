import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ClassCard from './ClassCard';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { isTeacher } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      // Add logic for today's classes
      return true;
    }
    return true;
  });

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
          <h1>My Classes</h1>
          <p style={{ color: 'var(--text-light)' }}>
            {isTeacher ? 'Manage your classes and students' : 'View your enrolled classes'}
          </p>
        </div>
        {isTeacher && (
          <Link to="/classes/create" className="btn btn-primary">
            + Create New Class
          </Link>
        )}
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-md)', 
        marginBottom: 'var(--space-xl)',
        flexWrap: 'wrap'
      }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All Classes
        </button>
        <button
          className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('today')}
        >
          Today's Classes
        </button>
        <button
          className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-number">{classes.length}</div>
          <div className="stat-label">Total Classes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">
            {classes.reduce((acc, cls) => acc + (cls.students?.length || 0), 0)}
          </div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">
            {classes.reduce((acc, cls) => acc + (cls.assignments?.length || 0), 0)}
          </div>
          <div className="stat-label">Assignments</div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div className="classes-grid">
          {filteredClasses.map(cls => (
            <ClassCard key={cls.id} classData={cls} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📚</div>
          <h3>No Classes Found</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-lg)' }}>
            {isTeacher 
              ? "You haven't created any classes yet. Create your first class to get started!"
              : "You're not enrolled in any classes yet. Contact your teacher to enroll."}
          </p>
          {isTeacher && (
            <Link to="/classes/create" className="btn btn-primary">
              Create Your First Class
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassList;