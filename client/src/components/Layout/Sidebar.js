import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, isTeacher } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['teacher', 'student']
    },
    {
      icon: '📚',
      label: 'Classes',
      path: '/classes',
      roles: ['teacher', 'student']
    },
    {
      icon: '📝',
      label: 'Attendance',
      path: '/attendance',
      roles: ['teacher', 'student']
    },
    {
      icon: '📋',
      label: 'Assignments',
      path: '/assignments',
      roles: ['teacher', 'student']
    },
    {
      icon: '📊',
      label: 'Grades',
      path: '/grades',
      roles: ['teacher', 'student']
    },
    {
      icon: '➕',
      label: 'Create Class',
      path: '/classes/create',
      roles: ['teacher']
    },
    {
      icon: '👥',
      label: 'Enroll Students',
      path: '/enroll',
      roles: ['teacher']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1001,
          display: 'none',
          background: 'var(--maroon-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{
          padding: 'var(--space-lg)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 'var(--space-md)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <div className="user-avatar" style={{
              width: '50px',
              height: '50px',
              fontSize: '1.2rem'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--maroon-primary)' }}>
                {user?.name}
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: '0.85rem',
                color: 'var(--text-light)',
                textTransform: 'capitalize'
              }}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          {filteredMenuItems.map((item, index) => (
            <li key={index} className="sidebar-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
                {isTeacher && item.label === 'Create Class' && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--maroon-primary)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem'
                  }}>
                    NEW
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {isTeacher && (
          <div style={{
            padding: 'var(--space-lg)',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto'
          }}>
            <div style={{
              background: 'var(--cream-dark)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-medium)',
                marginBottom: 'var(--space-sm)'
              }}>
                📅 Today's Schedule
              </p>
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--text-light)'
              }}>
                You have 3 classes today
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
        />
      )}

      <style jsx="true">{`
        @media (max-width: 768px) {
          .sidebar-toggle {
            display: block !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            position: fixed;
            z-index: 1000;
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;