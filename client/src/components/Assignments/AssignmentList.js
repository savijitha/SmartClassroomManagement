import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AssignmentList = () => {
  const { isTeacher } = useAuth();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const classFilter = queryParams.get('class');

  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classFilter || 'all');
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, assignmentsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/assignments')
      ]);
      
      setClasses(classesRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (selectedClass !== 'all' && assignment.classId !== selectedClass) return false;
    if (filter === 'pending' && assignment.status !== 'pending') return false;
    if (filter === 'submitted' && assignment.status !== 'submitted') return false;
    if (filter === 'graded' && assignment.status !== 'graded') return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--warning)';
      case 'submitted': return 'var(--info)';
      case 'graded': return 'var(--success)';
      default: return 'var(--text-light)';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
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
          <h1>Assignments</h1>
          <p style={{ color: 'var(--text-light)' }}>
            {isTeacher ? 'Manage and grade assignments' : 'View and submit assignments'}
          </p>
        </div>
        {isTeacher && selectedClass !== 'all' && (
          <Link 
            to={`/assignments/create/${selectedClass}`}
            className="btn btn-primary"
          >
            + Create Assignment
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
            <label className="form-label">Filter by Class</label>
            <select 
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Status</label>
            <select 
              className="form-control"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Assignments</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length > 0 ? (
        <div>
          {filteredAssignments.map(assignment => (
            <div key={assignment.id} className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 'var(--space-md)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    <h3 style={{ margin: 0 }}>{assignment.title}</h3>
                    <span style={{ 
                      background: getStatusColor(assignment.status),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {assignment.status || 'pending'}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-md)' }}>
                    {assignment.description}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    gap: 'var(--space-lg)',
                    fontSize: '0.9rem',
                    color: 'var(--text-light)'
                  }}>
                    <span>📚 Class: {classes.find(c => c.id === assignment.classId)?.name || 'Unknown'}</span>
                    <span className={isOverdue(assignment.dueDate) ? 'due-date urgent' : 'due-date'}>
                      📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      {isOverdue(assignment.dueDate) && ' (Overdue)'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Link 
                    to={`/assignments/${assignment.id}`}
                    className="btn btn-outline"
                  >
                    View Details
                  </Link>
                  {!isTeacher && assignment.status !== 'submitted' && !isOverdue(assignment.dueDate) && (
                    <Link 
                      to={`/assignments/${assignment.id}/submit`}
                      className="btn btn-primary"
                    >
                      Submit
                    </Link>
                  )}
                  {isTeacher && (
                    <Link 
                      to={`/assignments/${assignment.id}/grade`}
                      className="btn btn-success"
                    >
                      Grade
                    </Link>
                  )}
                </div>
              </div>

              {/* Submission Stats (for teachers) */}
              {isTeacher && (
                <div style={{ 
                  marginTop: 'var(--space-lg)',
                  paddingTop: 'var(--space-lg)',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Submissions: {assignment.submissions?.length || 0}/{assignment.totalStudents || 0}</span>
                    <div style={{ 
                      width: '200px', 
                      height: '6px', 
                      background: 'var(--cream-dark)',
                      borderRadius: '3px'
                    }}>
                      <div style={{ 
                        width: `${((assignment.submissions?.length || 0) / (assignment.totalStudents || 1)) * 100}%`, 
                        height: '100%', 
                        background: 'var(--sage-primary)',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📝</div>
          <h3>No Assignments Found</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-lg)' }}>
            {isTeacher 
              ? "You haven't created any assignments yet."
              : "No assignments available for your classes."}
          </p>
          {isTeacher && selectedClass !== 'all' && (
            <Link 
              to={`/assignments/create/${selectedClass}`}
              className="btn btn-primary"
            >
              Create Your First Assignment
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;