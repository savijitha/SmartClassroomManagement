import React, { useState, useEffect } from 'react';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { message, type = 'info', duration = 5000 } = event.detail;
      const id = Date.now();
      
      setToasts(prev => [...prev, { id, message, type, duration }]);
      
      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    window.addEventListener('app-toast', handleToast);
    
    return () => {
      window.removeEventListener('app-toast', handleToast);
    };
  }, []);

  const getTypeStyles = (type) => {
    switch(type) {
      case 'success':
        return {
          background: 'var(--success)',
          icon: '✅'
        };
      case 'error':
        return {
          background: 'var(--error)',
          icon: '❌'
        };
      case 'warning':
        return {
          background: 'var(--warning)',
          icon: '⚠️'
        };
      default:
        return {
          background: 'var(--info)',
          icon: 'ℹ️'
        };
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const styles = getTypeStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className="toast"
            style={{
              background: styles.background,
            }}
          >
            <span className="toast-icon">{styles.icon}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        );
      })}

      <style jsx="true">{`
        .toast-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .toast {
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-md);
          color: white;
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          min-width: 300px;
          max-width: 400px;
          animation: slideInRight 0.3s ease;
        }

        .toast-icon {
          font-size: 1.2rem;
        }

        .toast-message {
          flex: 1;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .toast-container {
            left: 20px;
            right: 20px;
          }
          
          .toast {
            min-width: auto;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;