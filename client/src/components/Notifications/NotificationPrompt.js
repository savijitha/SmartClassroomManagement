import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';

const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptData, setPromptData] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const notificationChoice = localStorage.getItem('notification_choice');
    if (notificationChoice) {
      return; // Don't show if already chose
    }

    // Check if we should show the prompt
    const checkPrompt = () => {
      const prompt = notificationService.getPermissionPrompt();
      if (prompt) {
        setPromptData(prompt);
        setShowPrompt(true);
      }
    };

    // Check after a short delay
    const timer = setTimeout(checkPrompt, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = async () => {
    setShowPrompt(false);
    localStorage.setItem('notification_choice', 'accepted');
    await promptData.onAccept();
  };

  const handleDecline = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('notification_choice', 'declined');
    promptData.onDecline();
  };

  const handleLater = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Don't save choice, will ask again next session
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="notification-prompt-overlay">
      <div className="notification-prompt-card">
        <div className="prompt-header">
          <div className="prompt-icon">🔔</div>
          <h3>Stay Updated with Notifications</h3>
          <button className="prompt-close" onClick={handleLater}>✕</button>
        </div>

        <div className="prompt-body">
          <p className="prompt-message">
            Get instant alerts when someone:
          </p>
          
          <ul className="prompt-features">
            <li>💬 Starts a new discussion</li>
            <li>💭 Replies to your questions</li>
            <li>✅ Marks a thread as resolved</li>
            <li>📢 Posts important announcements</li>
          </ul>

          <div className="prompt-illustration">
            <div className="illustration-badge">
              <span className="badge-icon">🔔</span>
              <span className="badge-text">New comment on "Data Structures"</span>
            </div>
            <div className="illustration-badge">
              <span className="badge-icon">💬</span>
              <span className="badge-text">Teacher started a discussion</span>
            </div>
          </div>
        </div>

        <div className="prompt-footer">
          <button className="btn btn-outline" onClick={handleLater}>
            Maybe Later
          </button>
          <button className="btn btn-outline" onClick={handleDecline}>
            Don't Allow
          </button>
          <button className="btn btn-primary" onClick={handleAccept}>
            Enable Notifications
          </button>
        </div>

        <p className="prompt-note">
          You can always change this in your profile settings
        </p>
      </div>

      <style jsx="true">{`
        .notification-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .notification-prompt-card {
          background: white;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 40px rgba(128, 0, 0, 0.2);
          animation: slideUp 0.4s ease;
          overflow: hidden;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .prompt-header {
          background: linear-gradient(135deg, var(--maroon-primary), var(--maroon-dark));
          color: white;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .prompt-icon {
          font-size: 2.5rem;
          background: rgba(255, 255, 255, 0.2);
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .prompt-header h3 {
          margin: 0;
          color: white;
          font-size: 1.5rem;
          flex: 1;
        }

        .prompt-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: background 0.2s;
        }

        .prompt-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .prompt-body {
          padding: 24px;
        }

        .prompt-message {
          color: var(--text-medium);
          margin-bottom: 16px;
          font-size: 1.1rem;
        }

        .prompt-features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .prompt-features li {
          padding: 8px 12px;
          background: var(--cream-primary);
          border-radius: 12px;
          color: var(--text-dark);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-color);
        }

        .prompt-illustration {
          background: var(--cream-dark);
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .illustration-badge {
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
        }

        .badge-icon {
          font-size: 1.5rem;
        }

        .badge-text {
          color: var(--text-medium);
          font-size: 0.95rem;
        }

        .prompt-footer {
          padding: 24px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          background: var(--cream-primary);
        }

        .prompt-note {
          text-align: center;
          color: var(--text-light);
          font-size: 0.85rem;
          padding: 0 24px 24px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .prompt-features {
            grid-template-columns: 1fr;
          }

          .prompt-footer {
            flex-direction: column;
          }

          .prompt-footer button {
            width: 100%;
          }

          .prompt-header h3 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPrompt;