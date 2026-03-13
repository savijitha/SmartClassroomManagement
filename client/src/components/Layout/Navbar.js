import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

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
          {user?.role === 'teacher' && (
            <Link to="/schedule" className="navbar-link">Schedule</Link>
          )}
        </div>

        <div className="navbar-user" ref={dropdownRef}>
          <NotificationBell />
          
          <div className="user-dropdown">
            <button 
              className="dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="welcome-text">Welcome, {user?.name}</span>
              <div className="user-avatar">
                {getInitials(user?.name)}
              </div>
              <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dropdown-icon">👤</span>
                  Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dropdown-icon">⚙️</span>
                  Settings
                </Link>
                <div className="dropdown-divider"></div>
                <Link 
                  to="/help" 
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dropdown-icon">❓</span>
                  Help & Support
                </Link>
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }} 
                  className="dropdown-item logout-btn"
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add the dropdown styles here */}
      <style jsx="true">{`
        .navbar {
          background: var(--gradient-maroon);
          padding: var(--space-md) 0;
          box-shadow: var(--shadow-md);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none;
          font-family: var(--font-heading);
        }

        .navbar-logo span {
          color: white;
        }

        .navbar-menu {
          display: flex;
          gap: var(--space-xl);
          align-items: center;
        }

        .navbar-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: var(--space-xs) 0;
          position: relative;
          opacity: 0.9;
          transition: opacity var(--transition-fast);
        }

        .navbar-link:hover {
          opacity: 1;
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: white;
          transition: width var(--transition-normal);
        }

        .navbar-link:hover::after {
          width: 100%;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          position: relative;
        }

        /* Dropdown Styles */
        .user-dropdown {
          position: relative;
        }

        .dropdown-trigger {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
          color: white;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          transition: background 0.2s;
        }

        .dropdown-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .welcome-text {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .user-avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: var(--cream-primary);
          color: var(--maroon-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .dropdown-arrow {
          font-size: 0.8rem;
          margin-left: var(--space-xs);
          opacity: 0.8;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          min-width: 220px;
          z-index: 1000;
          animation: slideDown 0.2s ease;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          color: var(--text-dark);
          text-decoration: none;
          transition: all 0.2s;
          width: 100%;
          border: none;
          background: none;
          font-size: 0.95rem;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-item:hover {
          background: var(--cream-primary);
          color: var(--maroon-primary);
        }

        .dropdown-icon {
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: var(--space-xs) 0;
        }

        .logout-btn {
          color: var(--error);
        }

        .logout-btn:hover {
          background: rgba(167, 95, 47, 0.1);
          color: var(--error);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .navbar-menu {
            display: none;
          }

          .welcome-text {
            display: none;
          }

          .dropdown-trigger {
            padding: var(--space-xs);
          }

          .dropdown-menu {
            position: fixed;
            top: 70px;
            right: 10px;
            left: 10px;
            width: auto;
          }
        }

        @media (max-width: 480px) {
          .navbar-logo span {
            font-size: 1.2rem;
          }

          .user-avatar {
            width: 30px;
            height: 30px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;