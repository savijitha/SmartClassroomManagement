import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="dashboard" style={{ 
      textAlign: 'center', 
      padding: 'var(--space-xxl)',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '6rem', marginBottom: 'var(--space-lg)' }}>404</div>
      <h1 style={{ marginBottom: 'var(--space-md)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 'var(--space-xl)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;