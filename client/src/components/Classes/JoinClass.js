import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const JoinClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classData, setClassData] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(3);

  useEffect(() => {
    // First, check if user is logged in
    if (!user) {
      // Save the join link to redirect back after login
      localStorage.setItem('pendingJoinLink', `/join-class/${classId}`);
      navigate('/login');
      return;
    }

    // Check user role
    if (user.role === 'teacher') {
      setError('This join link is for students only. Teachers cannot join classes as students.');
      setLoading(false);
      return;
    }

    // Student - proceed to join
    if (user.role === 'student') {
      joinClass();
    }
  }, [classId, user, navigate]);

  useEffect(() => {
    // Countdown timer for redirect on success
    if (success && redirectTimer > 0) {
      const timer = setTimeout(() => {
        setRedirectTimer(redirectTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && redirectTimer === 0) {
      navigate(`/classes/${classId}`);
    }
  }, [success, redirectTimer, classId, navigate]);

  const joinClass = async () => {
  try {
    // Send the current user's ID in the request
    await api.post(`/classes/${classId}/enroll`, { 
      studentId: user.id 
    });

    setSuccess(`Successfully joined the class!`);
    
    setTimeout(() => {
      navigate(`/classes/${classId}`);
    }, 2000);

  } catch (error) {
    console.error('Join class error:', error);
    if (error.response?.status === 404) {
      setError('Class not found. The link may be invalid.');
    } else if (error.response?.status === 400) {
      setError(error.response.data?.error || 'You are already in this class');
    } else {
      setError('Failed to join class. Please try again later.');
    }
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="dashboard" style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: 'var(--space-lg)', color: 'var(--text-light)' }}>
          Verifying class link...
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card" style={{ padding: 'var(--space-xxl)', textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🔒</div>
            <h2 style={{ color: 'var(--error)', marginBottom: 'var(--space-md)' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-medium)', marginBottom: 'var(--space-xl)' }}>{error}</p>
            
            {error.includes('teacher') ? (
              <div>
                <p style={{ marginBottom: 'var(--space-lg)' }}>
                  As a teacher, you should share this link with your students instead.
                </p>
                {classData && (
                  <div style={{ 
                    background: 'var(--cream-primary)', 
                    padding: 'var(--space-md)', 
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)',
                    textAlign: 'left'
                  }}>
                    <p><strong>Class:</strong> {classData.name}</p>
                    <p><strong>Your Join Link:</strong></p>
                    <div style={{ 
                      display: 'flex', 
                      gap: 'var(--space-sm)',
                      background: 'white',
                      padding: 'var(--space-sm)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <code style={{ flex: 1, fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {window.location.origin}/join-class/{classId}
                      </code>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '4px 8px' }}
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/join-class/${classId}`);
                          alert('Link copied to clipboard!');
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                )}
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Teacher Dashboard
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                <Link to="/dashboard" className="btn btn-outline">
                  Go to Dashboard
                </Link>
                <Link to="/classes" className="btn btn-primary">
                  Browse Classes
                </Link>
              </div>
            )}
          </>
        ) : success ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎉</div>
            <h2 style={{ color: 'var(--success)', marginBottom: 'var(--space-md)' }}>Welcome to the Class!</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>{success}</p>
            <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-lg)' }}>
              Redirecting to class in {redirectTimer} seconds...
            </p>
            <div className="loading-spinner" style={{ width: '30px', height: '30px' }}></div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default JoinClass;