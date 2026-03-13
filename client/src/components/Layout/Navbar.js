import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span>📚 SmartClass</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/classes" className="navbar-link">Classes</Link>
          <Link to="/attendance" className="navbar-link">Attendance</Link>
          <Link to="/assignments" className="navbar-link">Assignments</Link>
          <Link to="/grades" className="navbar-link">Grades</Link>
        </div>

        <div className="navbar-user">
          <span>Welcome, {user?.name}</span>
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ 
              background: 'transparent', 
              borderColor: 'white', 
              color: 'white',
              padding: 'var(--space-xs) var(--space-md)'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;