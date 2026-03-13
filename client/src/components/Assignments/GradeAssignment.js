import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const GradeAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [classData, setClassData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    score: '',
    feedback: '',
    maxScore: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const fetchAssignmentData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        api.get(`/assignments/${id}`),
        api.get(`/assignments/${id}/submissions`)
      ]);
      
      setAssignment(assignmentRes.data);
      setSubmissions(submissionsRes.data);
      setGradeData(prev => ({
        ...prev,
        maxScore: assignmentRes.data.totalPoints || 100
      }));
      
      // Fetch class details
      const classResponse = await api.get(`/classes/${assignmentRes.data.classId}`);
      setClassData(classResponse.data);
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
      setError('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.grade?.score || '',
      feedback: submission.grade?.feedback || '',
      maxScore: assignment.totalPoints || 100
    });
    setError('');
    setSuccess('');
  };

  const handleGradeChange = (e) => {
    setGradeData({
      ...gradeData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    
    if (!gradeData.score) {
      setError('Please enter a score');
      return;
    }

    if (gradeData.score < 0 || gradeData.score > gradeData.maxScore) {
      setError(`Score must be between 0 and ${gradeData.maxScore}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post(`/assignments/${id}/grade`, {
        studentId: selectedSubmission.studentId,
        score: parseInt(gradeData.score),
        feedback: gradeData.feedback
      });
      
      setSuccess('Grade saved successfully!');
      
      // Refresh submissions
      const submissionsRes = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(submissionsRes.data);
      
      // Update selected submission with new grade
      const updatedSubmission = submissionsRes.data.find(
        s => s.studentId === selectedSubmission.studentId
      );
      setSelectedSubmission(updatedSubmission);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (submission) => {
    if (submission.grade) {
      return <span className="status-badge status-present">Graded</span>;
    }
    return <span className="status-badge status-late">Pending</span>;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">Assignment not found</div>
        <Link to="/assignments" className="btn btn-primary">Back to Assignments</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to={`/assignments?class=${assignment.classId}`} className="btn btn-outline" style={{ marginBottom: 'var(--space-md)' }}>
            ← Back to Assignments
          </Link>
          <h1>Grade Assignment</h1>
          <p style={{ color: 'var(--text-light)' }}>
            {assignment.title} • {classData?.name}
          </p>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          <div>
            <h3>{assignment.title}</h3>
            <p style={{ color: 'var(--text-medium)' }}>{assignment.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {submissions.filter(s => s.grade).length}/{submissions.length} Graded
            </div>
            <div style={{ color: 'var(--text-light)' }}>
              Total Points: {assignment.totalPoints || 100}
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 'var(--space-xl)'
      }}>
        {/* Submissions List */}
        <div className="card">
          <h3>Student Submissions</h3>
          
          {submissions.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {submissions.map((submission, index) => (
                <div 
                  key={submission.studentId}
                  className={`assignment-item ${selectedSubmission?.studentId === submission.studentId ? 'selected' : ''}`}
                  onClick={() => handleSelectSubmission(submission)}
                  style={{ 
                    cursor: 'pointer',
                    border: selectedSubmission?.studentId === submission.studentId 
                      ? '2px solid var(--maroon-primary)' 
                      : '1px solid var(--border-color)',
                    marginBottom: 'var(--space-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-xs)'
                    }}>
                      <h4 style={{ margin: 0 }}>{submission.studentName}</h4>
                      {getStatusBadge(submission)}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: 'var(--space-md)',
                      fontSize: '0.9rem',
                      color: 'var(--text-light)'
                    }}>
                      <span>📅 Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      {submission.grade && (
                        <span>📊 Score: {submission.grade.score}/{assignment.totalPoints || 100}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>📭</div>
              <p style={{ color: 'var(--text-light)' }}>No submissions yet</p>
            </div>
          )}
        </div>

        {/* Grading Panel */}
        <div className="card">
          {selectedSubmission ? (
            <>
              <h3>Grading: {selectedSubmission.studentName}</h3>
              
              {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-lg)' }}>
                  {success}
                </div>
              )}

              <div style={{ 
                background: 'var(--cream-primary)',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)'
              }}>
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>Student's Submission:</h4>
                <p style={{ whiteSpace: 'pre-line' }}>{selectedSubmission.content}</p>
                
                {selectedSubmission.notes && (
                  <>
                    <hr style={{ margin: 'var(--space-md) 0', borderColor: 'var(--border-color)' }} />
                    <p><strong>Student's Notes:</strong> {selectedSubmission.notes}</p>
                  </>
                )}
                
                <div style={{ 
                  marginTop: 'var(--space-md)',
                  fontSize: '0.9rem',
                  color: 'var(--text-light)'
                }}>
                  Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </div>
              </div>

              <form onSubmit={handleSubmitGrade}>
                <div className="form-group">
                  <label className="form-label">
                    Score (out of {gradeData.maxScore}) *
                  </label>
                  <input
                    type="number"
                    name="score"
                    className="form-control"
                    value={gradeData.score}
                    onChange={handleGradeChange}
                    min="0"
                    max={gradeData.maxScore}
                    step="0.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Feedback</label>
                  <textarea
                    name="feedback"
                    className="form-control"
                    value={gradeData.feedback}
                    onChange={handleGradeChange}
                    placeholder="Provide constructive feedback to the student..."
                    rows="4"
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--space-md)', 
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : selectedSubmission.grade ? 'Update Grade' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--space-xxl)',
              color: 'var(--text-light)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📝</div>
              <h3>Select a Submission</h3>
              <p>Choose a student submission from the list to start grading</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeAssignment;