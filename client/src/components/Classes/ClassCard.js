import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ClassCard = ({ classData }) => {
  const { isTeacher } = useAuth();

  const getStatusColor = () => {
    // Add logic for class status
    return 'var(--sage-primary)';
  };

  return (
    <div className="class-card">
      <div className="class-header" style={{ 
        background: 'var(--gradient-maroon)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '-20px', 
          right: '-20px', 
          width: '80px', 
          height: '80px', 
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ color: 'white', margin: '0 0 var(--space-xs) 0' }}>
            {classData.name}
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <span className="class-badge">
              {classData.students?.length || 0} Students
            </span>
            {isTeacher && (
              <span className="class-badge">
                {classData.assignments?.length || 0} Assignments
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="class-body">
        <p style={{ 
          color: 'var(--text-medium)', 
          marginBottom: 'var(--space-md)',
          minHeight: '60px'
        }}>
          {classData.description || 'No description provided'}
        </p>

        <div className="class-info">
          <span>👤 {isTeacher ? 'Your Class' : `Teacher: ${classData.teacherName}`}</span>
        </div>

        <div className="class-info">
          <span>📅 {classData.schedule || 'Schedule not set'}</span>
        </div>

        {!isTeacher && (
          <div className="class-info">
            <span>📊 Progress: 65%</span>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--cream-dark)',
              borderRadius: '3px',
              marginTop: 'var(--space-xs)'
            }}>
              <div style={{
                width: '65%',
                height: '100%',
                background: 'var(--sage-primary)',
                borderRadius: '3px'
              }} />
            </div>
          </div>
        )}
      </div>

      <div className="class-footer">
        <Link to={`/classes/${classData.id}`} className="btn btn-outline">
          View Details
        </Link>
        
        {isTeacher ? (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Link 
              to={`/attendance/mark/${classData.id}`}
              className="btn btn-primary"
              style={{ padding: 'var(--space-xs) var(--space-md)' }}
              title="Mark Attendance"
            >
              📋
            </Link>
            <Link 
              to={`/assignments/create/${classData.id}`}
              className="btn btn-success"
              style={{ padding: 'var(--space-xs) var(--space-md)' }}
              title="Create Assignment"
            >
              ✏️
            </Link>
          </div>
        ) : (
          <Link 
            to={`/assignments?class=${classData.id}`}
            className="btn btn-primary"
            style={{ padding: 'var(--space-xs) var(--space-md)' }}
          >
            View Assignments
          </Link>
        )}
      </div>
    </div>
  );
};

export default ClassCard;