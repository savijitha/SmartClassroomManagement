import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTeacher, user } = useAuth();
  
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      const [classRes, studentsRes, assignmentsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/classes/${id}/students`),
        api.get(`/assignments/class/${id}`)
      ]);
      
      setClassData(classRes.data);
      setStudents(studentsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (e) => {
  e.preventDefault();
  setEnrollError('');
  
  try {
    // Find student by email - using the correct endpoint
    const studentRes = await api.get(`/users?email=${enrollEmail}`);
    const student = studentRes.data;
    
    // Then enroll using the student ID
    await api.post(`/classes/${id}/enroll`, { 
      studentId: student.id
    });
    
    setShowEnrollModal(false);
    setEnrollEmail('');
    fetchClassData(); // Refresh data
    alert('Student enrolled successfully!');
  } catch (error) {
    console.error('Enrollment error:', error);
    setEnrollError(error.response?.data?.error || 'Failed to enroll student');
  }
};

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">Class not found</div>
        <Link to="/classes" className="btn btn-primary">Back to Classes</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <Link to="/classes" className="btn btn-outline" style={{ marginBottom: 'var(--space-md)' }}>
            ← Back to Classes
          </Link>
          <h1>{classData.name}</h1>
          <p style={{ color: 'var(--text-light)' }}>{classData.description}</p>
        </div>
        {isTeacher && (
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowEnrollModal(true)}
            >
              + Enroll Student
            </button>
            <Link 
              to={`/assignments/create/${id}`}
              className="btn btn-success"
            >
              Create Assignment
            </Link>
          </div>
        )}
      </div>

      {/* Class Info Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{students.length}</div>
          <div className="stat-label">Enrolled Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-number">{assignments.length}</div>
          <div className="stat-label">Assignments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">85%</div>
          <div className="stat-label">Avg. Attendance</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{classData.schedule || 'TBD'}</div>
          <div className="stat-label">Schedule</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-md)', 
        borderBottom: '2px solid var(--border-color)',
        marginBottom: 'var(--space-xl)'
      }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('overview')}
          style={{ borderBottom: activeTab === 'overview' ? '2px solid var(--maroon-primary)' : 'none' }}
        >
          Overview
        </button>
        <button
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('students')}
        >
          Students ({students.length})
        </button>
        <button
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3>Class Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div>
                  <p><strong>Teacher:</strong> {classData.teacherName}</p>
                  <p><strong>Schedule:</strong> {classData.schedule || 'Not set'}</p>
                  <p><strong>Created:</strong> {new Date(classData.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p><strong>Total Students:</strong> {students.length}</p>
                  <p><strong>Total Assignments:</strong> {assignments.length}</p>
                  <p><strong>Room:</strong> TBD</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Recent Activity</h3>
              <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                No recent activity
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="card">
            <h3>Enrolled Students</h3>
            {students.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Attendance</th>
                      <th>Grade</th>
                      {isTeacher && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>
                          <span className="status-badge status-present">85%</span>
                        </td>
                        <td>
                          <span className="grade-display" style={{ fontSize: '1rem' }}>B+</span>
                        </td>
                        {isTeacher && (
                          <td>
                            <button className="btn btn-outline" style={{ padding: '4px 8px' }}>
                              View
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: 'var(--space-xl)' }}>
                No students enrolled yet
              </p>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            {assignments.length > 0 ? (
              assignments.map(assignment => (
                <div key={assignment.id} className="assignment-item">
                  <div>
                    <h4>{assignment.title}</h4>
                    <p style={{ color: 'var(--text-light)' }}>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/assignments/${assignment.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
                <p style={{ color: 'var(--text-light)' }}>No assignments yet</p>
                {isTeacher && (
                  <Link to={`/assignments/create/${id}`} className="btn btn-primary">
                    Create First Assignment
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="card">
            <h3>Attendance Overview</h3>
            <div style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
              <p style={{ color: 'var(--text-light)' }}>Select a date to view attendance</p>
              <input 
                type="date" 
                className="form-control" 
                style={{ maxWidth: '200px', margin: '0 auto' }}
              />
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                View Attendance
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enroll New Student</h3>
              <button className="modal-close" onClick={() => setShowEnrollModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleEnrollStudent}>
              <div className="form-group">
                <label className="form-label">Student Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={enrollEmail}
                  onChange={(e) => setEnrollEmail(e.target.value)}
                  placeholder="Enter student's email"
                  required
                />
                {enrollError && <div className="error-message">{enrollError}</div>}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowEnrollModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetails;