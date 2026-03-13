import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import notificationService from '../../services/notificationService';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    bio: '',
    phone: '',
    department: '',
    profilePicture: null
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: Notification.permission === 'granted',
    discussionNotifications: true,
    commentNotifications: true,
    assignmentNotifications: true,
    attendanceNotifications: true,
    gradeNotifications: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: 'everyone' // 'everyone', 'teachers', 'none'
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const response = await api.get('/users/settings');
      if (response.data) {
        setNotificationSettings(prev => ({ ...prev, ...response.data.notifications }));
        setPrivacySettings(prev => ({ ...prev, ...response.data.privacy }));
        setProfile(prev => ({ ...prev, ...response.data.profile }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationSettings(prev => ({
      ...prev,
      pushNotifications: granted
    }));

    if (granted) {
      setSuccessMessage('Notifications enabled successfully!');
    } else {
      setErrorMessage('Please allow notifications in your browser settings');
    }
  };

  const handleSaveSettings = async () => {
  setLoading(true);
  setSuccessMessage('');
  setErrorMessage('');

  try {
    const response = await api.put('/users/settings', {
      notifications: notificationSettings,
      privacy: privacySettings,
      profile: profile
    });
    
    setSuccessMessage(response.data.message || 'Settings saved successfully!');
  } catch (error) {
    console.error('Save settings error:', error);
    setErrorMessage(error.response?.data?.error || 'Failed to save settings');
  } finally {
    setLoading(false);
  }
};
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Profile Settings</h1>
        <p style={{ color: 'var(--text-light)' }}>
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="profile-container">
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name} />
              ) : (
                <span>{getInitials(profile.name)}</span>
              )}
            </div>
            <button className="btn btn-outline" onClick={() => document.getElementById('profile-pic-input').click()}>
              Change Photo
            </button>
            <input
              type="file"
              id="profile-pic-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePictureChange}
            />
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">March 2026</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Discussions</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Comments</span>
              <span className="stat-value">45</span>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              🔒 Privacy
            </button>
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🛡️ Security
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-error">{errorMessage}</div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  disabled
                />
                <small style={{ color: 'var(--text-light)' }}>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.role}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-control"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="profile-section">
              <h2>Notification Settings</h2>

              <div className="notification-permission-card">
                <div className="permission-icon">
                  {notificationSettings.pushNotifications ? '🔔' : '🔕'}
                </div>
                <div className="permission-info">
                  <h4>Push Notifications</h4>
                  <p>
                    {notificationSettings.pushNotifications
                      ? 'Notifications are enabled'
                      : 'Enable notifications to stay updated'}
                  </p>
                </div>
                <button
                  className={`btn ${notificationSettings.pushNotifications ? 'btn-outline' : 'btn-primary'}`}
                  onClick={handleNotificationPermission}
                  disabled={notificationSettings.pushNotifications}
                >
                  {notificationSettings.pushNotifications ? 'Enabled' : 'Enable'}
                </button>
              </div>

              <div className="settings-group">
                <h3>Notification Types</h3>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.discussionNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      discussionNotifications: e.target.checked
                    })}
                  />
                  <span>New discussions</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.commentNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      commentNotifications: e.target.checked
                    })}
                  />
                  <span>Comments on your discussions</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.assignmentNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      assignmentNotifications: e.target.checked
                    })}
                  />
                  <span>New assignments</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.attendanceNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      attendanceNotifications: e.target.checked
                    })}
                  />
                  <span>Attendance reminders</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.gradeNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      gradeNotifications: e.target.checked
                    })}
                  />
                  <span>Grade updates</span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Email Notifications</h3>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked
                    })}
                  />
                  <span>Receive email notifications</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="profile-section">
              <h2>Privacy Settings</h2>

              <div className="settings-group">
                <h3>Profile Visibility</h3>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={privacySettings.showEmail}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      showEmail: e.target.checked
                    })}
                  />
                  <span>Show email to other students</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={privacySettings.showPhone}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      showPhone: e.target.checked
                    })}
                  />
                  <span>Show phone number to other students</span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Messages</h3>
                <label className="form-label">Who can message you?</label>
                <select
                  className="form-control"
                  value={privacySettings.allowMessagesFrom}
                  onChange={(e) => setPrivacySettings({
                    ...privacySettings,
                    allowMessagesFrom: e.target.value
                  })}
                >
                  <option value="everyone">Everyone</option>
                  <option value="teachers">Teachers only</option>
                  <option value="none">No one</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="profile-section">
              <h2>Security Settings</h2>

              <div className="settings-group">
                <h3>Change Password</h3>
                <button className="btn btn-primary">
                  Change Password
                </button>
              </div>

              <div className="settings-group">
                <h3>Sessions</h3>
                <p>You are logged in on this device</p>
                <button className="btn btn-outline">
                  Logout from all devices
                </button>
              </div>

              <div className="settings-group danger-zone">
                <h3>Danger Zone</h3>
                <button className="btn btn-danger">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .profile-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-xl);
          margin-top: var(--space-xl);
        }

        .profile-sidebar {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          border: 1px solid var(--border-color);
          height: fit-content;
        }

        .profile-avatar-section {
          text-align: center;
          padding-bottom: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: var(--space-lg);
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          margin: 0 auto var(--space-md);
          background: var(--gradient-maroon);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 3rem;
          font-weight: 600;
          overflow: hidden;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-stats {
          margin-bottom: var(--space-lg);
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--border-color);
        }

        .stat-label {
          color: var(--text-light);
        }

        .stat-value {
          font-weight: 600;
          color: var(--maroon-primary);
        }

        .profile-tabs {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .tab-btn {
          padding: var(--space-sm) var(--space-md);
          background: none;
          border: none;
          border-radius: var(--radius-md);
          text-align: left;
          cursor: pointer;
          font-size: 1rem;
          color: var(--text-medium);
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: var(--cream-dark);
          color: var(--maroon-primary);
        }

        .tab-btn.active {
          background: var(--maroon-primary);
          color: white;
        }

        .profile-content {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          border: 1px solid var(--border-color);
        }

        .profile-section {
          margin-bottom: var(--space-xl);
        }

        .profile-section h2 {
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-sm);
          border-bottom: 2px solid var(--maroon-primary);
        }

        .profile-section h3 {
          margin: var(--space-lg) 0 var(--space-md);
          color: var(--text-medium);
        }

        .notification-permission-card {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          padding: var(--space-lg);
          background: var(--cream-primary);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
        }

        .permission-icon {
          font-size: 2.5rem;
        }

        .permission-info {
          flex: 1;
        }

        .permission-info h4 {
          margin: 0 0 var(--space-xs);
        }

        .permission-info p {
          margin: 0;
          color: var(--text-light);
        }

        .settings-group {
          margin-bottom: var(--space-xl);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: var(--cream-primary);
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .danger-zone {
          padding: var(--space-lg);
          border: 2px solid var(--error);
          border-radius: var(--radius-lg);
        }

        .danger-zone h3 {
          color: var(--error);
          margin-top: 0;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          padding-top: var(--space-xl);
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .profile-container {
            grid-template-columns: 1fr;
          }

          .notification-permission-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;