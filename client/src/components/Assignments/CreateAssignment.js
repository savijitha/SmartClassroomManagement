import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const CreateAssignment = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    instructions: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      setClassData(response.data);
    } catch (error) {
      console.error('Failed to fetch class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    
    try {
      await api.post('/assignments', {
        ...formData,
        classId
      });
      
      navigate(`/assignments?class=${classId}`);
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.error || 'Failed to create assignment' 
      });
    } finally {
      setSaving(false);
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
          <Link to={`/assignments?class=${classId}`} className="btn btn-outline" style={{ marginBottom: 'var(--space-md)' }}>
            ← Back to Assignments
          </Link>
          <h1>Create Assignment</h1>
          <p style={{ color: 'var(--text-light)' }}>
            Class: {classData?.name}
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Assignment Title *</label>
            <input
              type="text"
              name="title"
              className={`form-control ${errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Chapter 5: Algebra Problems"
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className={`form-control ${errors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the assignment requirements..."
              rows="4"
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Instructions</label>
            <textarea
              name="instructions"
              className="form-control"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Provide detailed instructions for students..."
              rows="6"
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="datetime-local"
                name="dueDate"
                className={`form-control ${errors.dueDate ? 'error' : ''}`}
                value={formData.dueDate}
                onChange={handleChange}
              />
              {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Total Points</label>
              <input
                type="number"
                name="totalPoints"
                className="form-control"
                value={formData.totalPoints}
                onChange={handleChange}
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
            <Link to={`/assignments?class=${classId}`} className="btn btn-outline">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;