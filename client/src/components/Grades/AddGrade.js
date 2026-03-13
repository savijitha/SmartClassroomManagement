import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const AddGrade = () => {
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    classId: '',
    assignmentId: '',
    studentId: '',
    score: '',
    maxScore: 100,
    comments: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState({
    classes: true,
    students: false,
    assignments: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      fetchClassData();
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  };

  const fetchClassData = async () => {
    setLoading(prev => ({ ...prev, students: true, assignments: true }));
    
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        api.get(`/classes/${formData.classId}/students`),
        api.get(`/assignments/class/${formData.classId}`)
      ]);
      
      setStudents(studentsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch class data:', error);
    } finally {
      setLoading(prev => ({ ...prev, students: false, assignments: false }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.classId) {
      setError('Please select a class');
      return;
    }
    
    if (!formData.assignmentId) {
      setError('Please select an assignment');
      return;
    }
    
    if (!formData.studentId) {
      setError('Please select a student');
      return;
    }
    
    if (!formData.score) {
      setError('Please enter a score');
      return;
    }
    
    if (formData.score < 0 || formData.score > formData.maxScore) {
      setError(`Score must be between 0 and ${formData.maxScore}`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post('/grades', formData);
      setSuccess('Grade added successfully!');
      
      // Reset form but keep class selected
      setFormData(prev => ({
        ...prev,
        assignmentId: '',
        studentId: '',
        score: '',
        comments: '',
        maxScore: 100
      }));
      
      // Refresh assignments and students
      await fetchClassData();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add grade');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAnother = () => {
    setSuccess('');
    setFormData(prev => ({
      ...prev,
      assignmentId: '',
      studentId: '',
      score: '',
      comments: ''
    }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <Link to="/grades" className="btn btn-outline" style={{ marginBottom: 'var(--space-md)' }}>
            ← Back to Grades
          </Link>
          <h1>Add New Grade</h1>
          <p style={{ color: 'var(--text-light)' }}>
            Record grades for student assignments
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-lg)' }}>
            {success}
            <button 
              onClick={handleAddAnother}
              style={{
                marginLeft: 'var(--space-md)',
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              Add Another
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Class Selection */}
          <div className="form-group">
            <label className="form-label">Select Class *</label>
            <select
              name="classId"
              className="form-control"
              value={formData.classId}
              onChange={handleChange}
              disabled={loading.classes}
              required
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Assignment Selection */}
          <div className="form-group">
            <label className="form-label">Select Assignment *</label>
            <select
              name="assignmentId"
              className="form-control"
              value={formData.assignmentId}
              onChange={handleChange}
              disabled={!formData.classId || loading.assignments}
              required
            >
              <option value="">Choose an assignment</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} (Due: {new Date(assignment.dueDate).toLocaleDateString()})
                </option>
              ))}
            </select>
            {loading.assignments && (
              <div className="loading-spinner" style={{ width: '20px', height: '20px', marginTop: 'var(--space-xs)' }}></div>
            )}
          </div>

          {/* Student Selection */}
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select
              name="studentId"
              className="form-control"
              value={formData.studentId}
              onChange={handleChange}
              disabled={!formData.classId || loading.students}
              required
            >
              <option value="">Choose a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {loading.students && (
              <div className="loading-spinner" style={{ width: '20px', height: '20px', marginTop: 'var(--space-xs)' }}></div>
            )}
          </div>

          {/* Grade Input */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div className="form-group">
              <label className="form-label">Score *</label>
              <input
                type="number"
                name="score"
                className="form-control"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max={formData.maxScore}
                step="0.5"
                placeholder="Enter score"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Score</label>
              <input
                type="number"
                name="maxScore"
                className="form-control"
                value={formData.maxScore}
                onChange={handleChange}
                min="1"
                max="1000"
              />
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Grade Date</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Comments */}
          <div className="form-group">
            <label className="form-label">Comments / Feedback</label>
            <textarea
              name="comments"
              className="form-control"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Add any comments or feedback for the student..."
              rows="4"
            />
          </div>

          {/* Grade Scale Preview */}
          {formData.score && formData.maxScore && (
            <div style={{ 
              background: 'var(--cream-dark)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Grade Preview</h4>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {formData.score}/{formData.maxScore}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Raw Score</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {Math.round((formData.score / formData.maxScore) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Percentage</div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    color: (() => {
                      const pct = (formData.score / formData.maxScore) * 100;
                      if (pct >= 90) return 'var(--success)';
                      if (pct >= 80) return 'var(--info)';
                      if (pct >= 70) return 'var(--warning)';
                      return 'var(--error)';
                    })()
                  }}>
                    {(() => {
                      const pct = (formData.score / formData.maxScore) * 100;
                      if (pct >= 90) return 'A';
                      if (pct >= 80) return 'B';
                      if (pct >= 70) return 'C';
                      if (pct >= 60) return 'D';
                      return 'F';
                    })()}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Letter Grade</div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-md)', 
            justifyContent: 'flex-end',
            borderTop: '1px solid var(--border-color)',
            paddingTop: 'var(--space-lg)',
            marginTop: 'var(--space-lg)'
          }}>
            <Link to="/grades" className="btn btn-outline">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Grade'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="card" style={{ 
        maxWidth: '800px', 
        margin: 'var(--space-xl) auto 0',
        background: 'var(--cream-primary)'
      }}>
        <h4>📝 Quick Tips for Grading</h4>
        <ul style={{ 
          paddingLeft: 'var(--space-lg)',
          color: 'var(--text-medium)',
          marginTop: 'var(--space-md)'
        }}>
          <li>Be consistent with your grading criteria</li>
          <li>Provide constructive feedback to help students improve</li>
          <li>Consider using rubrics for complex assignments</li>
          <li>Grade in a timely manner to keep students engaged</li>
          <li>Double-check calculations before submitting</li>
        </ul>
      </div>
    </div>
  );
};

export default AddGrade;