import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const SubmitAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [classData, setClassData] = useState(null);
  const [submission, setSubmission] = useState({
    content: '',
    notes: ''
  });
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const fetchAssignmentData = async () => {
    try {
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data);
      
      // Fetch class details
      const classResponse = await api.get(`/classes/${response.data.classId}`);
      setClassData(classResponse.data);
      
      // Check if already submitted
      const submissionResponse = await api.get(`/assignments/${id}/my-submission`);
      if (submissionResponse.data) {
        setExistingSubmission(submissionResponse.data);
        setSubmission({
          content: submissionResponse.data.content,
          notes: submissionResponse.data.notes || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
      setError('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSubmission({
      ...submission,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submission.content.trim()) {
      setError('Please enter your submission content');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/assignments/${id}/submit`, {
        submissionText: submission.content,
        notes: submission.notes
      });
      
      navigate(`/assignments?class=${assignment.classId}`, {
        state: { message: 'Assignment submitted successfully!' }
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = () => {
    return assignment && new Date(assignment.dueDate) < new Date();
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
          <h1>Submit Assignment</h1>
          <p style={{ color: 'var(--text-light)' }}>
            {assignment.title} • {classData?.name}
          </p>
        </div>
      </div>

      {/* Assignment Info Card */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-md)'
        }}>
          <div>
            <h3>{assignment.title}</h3>
            <p style={{ color: 'var(--text-medium)', marginTop: 'var(--space-sm)' }}>
              {assignment.description}
            </p>
          </div>
          <div style={{ 
            background: isOverdue() ? 'var(--error)' : 'var(--sage-primary)',
            color: 'white',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Due Date</div>
            <div style={{ fontWeight: 'bold' }}>
              {new Date(assignment.dueDate).toLocaleDateString()}
            </div>
            {isOverdue() && <div style={{ fontSize: '0.8rem' }}>Overdue</div>}
          </div>
        </div>

        {assignment.instructions && (
          <div style={{ 
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-md)',
            background: 'var(--cream-dark)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Instructions:</h4>
            <p style={{ color: 'var(--text-medium)', whiteSpace: 'pre-line' }}>
              {assignment.instructions}
            </p>
          </div>
        )}
      </div>

      {isOverdue() && !existingSubmission && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
          ⚠️ This assignment is overdue. Please contact your teacher if you need to submit late.
        </div>
      )}

      {existingSubmission ? (
        <div className="card">
          <div style={{ 
            background: 'var(--sage-light)',
            color: 'var(--sage-dark)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <h4 style={{ marginBottom: 'var(--space-xs)' }}>You have already submitted this assignment</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Submitted on: {new Date(existingSubmission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <h3>Your Submission</h3>
          <div style={{ 
            background: 'var(--cream-primary)',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            marginTop: 'var(--space-md)'
          }}>
            <p style={{ whiteSpace: 'pre-line' }}>{existingSubmission.content}</p>
            {existingSubmission.notes && (
              <>
                <hr style={{ margin: 'var(--space-md) 0', borderColor: 'var(--border-color)' }} />
                <p><strong>Notes:</strong> {existingSubmission.notes}</p>
              </>
            )}
          </div>

          {existingSubmission.grade && (
            <div style={{ 
              marginTop: 'var(--space-lg)',
              padding: 'var(--space-md)',
              background: 'var(--sage-light)',
              borderRadius: 'var(--radius-md)'
            }}>
              <h4>Grade: {existingSubmission.grade.score}/{assignment.totalPoints || 100}</h4>
              {existingSubmission.grade.feedback && (
                <p><strong>Feedback:</strong> {existingSubmission.grade.feedback}</p>
              )}
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginTop: 'var(--space-xl)'
          }}>
            <Link to={`/assignments?class=${assignment.classId}`} className="btn btn-primary">
              Back to Assignments
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Your Submission * <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  (Minimum 10 characters)
                </span>
              </label>
              <textarea
                name="content"
                className="form-control"
                value={submission.content}
                onChange={handleChange}
                placeholder="Enter your assignment submission here..."
                rows="10"
                required
                minLength="10"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Additional Notes <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  (Optional)
                </span>
              </label>
              <textarea
                name="notes"
                className="form-control"
                value={submission.notes}
                onChange={handleChange}
                placeholder="Any comments or notes for your teacher..."
                rows="3"
              />
            </div>

            <div style={{ 
              background: 'var(--cream-dark)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Submission Guidelines:</h4>
              <ul style={{ 
                paddingLeft: 'var(--space-lg)',
                color: 'var(--text-medium)',
                fontSize: '0.95rem'
              }}>
                <li>Make sure your submission is complete and proofread</li>
                <li>Include all required work and explanations</li>
                <li>You can only submit once - review before submitting</li>
                <li>Late submissions may be subject to grade deductions</li>
              </ul>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-md)', 
              justifyContent: 'flex-end'
            }}>
              <Link to={`/assignments?class=${assignment.classId}`} className="btn btn-outline">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || isOverdue()}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubmitAssignment;