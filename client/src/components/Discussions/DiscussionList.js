import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import notificationService from '../../services/notificationService'; // We'll create this

const DiscussionList = ({ classId }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', tags: '' });
  const [unreadThreads, setUnreadThreads] = useState({}); // Track which threads have new activity

  useEffect(() => {
    fetchThreads();
    loadReadStatus();
    
    // Listen for new notifications
    const handleNewNotification = (notification) => {
      if (notification.type === 'new_thread' || notification.type === 'new_comment') {
        // Mark this thread as having new activity
        if (notification.threadId) {
          setUnreadThreads(prev => ({
            ...prev,
            [notification.threadId]: true
          }));
        }
      }
    };

    notificationService.on('notification', handleNewNotification);
    
    return () => {
      notificationService.off('notification', handleNewNotification);
    };
  }, [classId]);

  const fetchThreads = async () => {
    try {
      const response = await api.get(`/discussions/${classId}/threads?limit=50`);
      setThreads(response.data);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReadStatus = () => {
    // Load which threads user has viewed from localStorage
    const viewed = JSON.parse(localStorage.getItem(`viewed_threads_${classId}`) || '{}');
    setUnreadThreads(viewed);
  };

  const markThreadAsRead = (threadId) => {
    // Mark thread as read in localStorage
    const viewed = JSON.parse(localStorage.getItem(`viewed_threads_${classId}`) || '{}');
    viewed[threadId] = Date.now();
    localStorage.setItem(`viewed_threads_${classId}`, JSON.stringify(viewed));
    
    setUnreadThreads(prev => ({
      ...prev,
      [threadId]: false
    }));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchThreads();
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.get(`/discussions/${classId}/threads?search=${encodeURIComponent(searchTerm)}`);
      setThreads(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) return;

    try {
      const tags = newThread.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await api.post(`/discussions/${classId}/threads`, {
        title: newThread.title,
        content: newThread.content,
        tags
      });
      
      setShowNewThreadModal(false);
      setNewThread({ title: '', content: '', tags: '' });
      fetchThreads();
      
      // The new thread will automatically get notifications for others
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="discussion-list">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap',
        gap: 'var(--space-md)'
      }}>
        <h3>Discussion Forum</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewThreadModal(true)}
        >
          + New Discussion
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-lg)'
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          🔍 Search
        </button>
      </div>

      {/* Threads List */}
      {threads.length > 0 ? (
        <div className="threads-list">
          {threads.map(thread => {
            const hasNewActivity = unreadThreads[thread.id];
            
            return (
              <Link 
                to={`/discussions/${classId}/${thread.id}`}
                key={thread.id}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => markThreadAsRead(thread.id)}
              >
                <div className={`thread-card ${hasNewActivity ? 'unread' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                        <h4 style={{ margin: 0 }}>
                          {thread.title}
                          {hasNewActivity && (
                            <span style={{
                              display: 'inline-block',
                              width: '10px',
                              height: '10px',
                              background: 'var(--maroon-primary)',
                              borderRadius: '50%',
                              marginLeft: 'var(--space-sm)'
                            }} />
                          )}
                        </h4>
                        {thread.isResolved && (
                          <span className="status-badge status-present">✓ Resolved</span>
                        )}
                      </div>
                      
                      <p style={{ 
                        color: 'var(--text-medium)',
                        marginBottom: 'var(--space-sm)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {thread.content}
                      </p>

                      <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                        <span>👤 {thread.createdByName}</span>
                        {thread.createdByRole === 'teacher' && (
                          <span className="teacher-badge" style={{ background: 'var(--maroon-primary)', color: 'white', padding: '2px 6px', borderRadius: '12px' }}>
                            Teacher
                          </span>
                        )}
                        <span>📅 {formatTimeAgo(thread.createdAt)}</span>
                        <span>👍 {thread.upvoteCount || 0}</span>
                        <span>💬 {thread.commentCount || 0}</span>
                        <span>👁️ {thread.views || 0}</span>
                      </div>

                      {thread.tags && thread.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                          {thread.tags.map(tag => (
                            <span key={tag} style={{
                              background: 'var(--cream-dark)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              color: 'var(--text-medium)'
                            }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>
                      {thread.isResolved ? '✅' : '💬'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>💭</div>
          <h3>No discussions yet</h3>
          <p style={{ color: 'var(--text-light)' }}>
            Be the first to start a discussion!
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowNewThreadModal(true)}
          >
            Start a Discussion
          </button>
        </div>
      )}

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="modal-overlay" onClick={() => setShowNewThreadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Start New Discussion</h3>
              <button className="modal-close" onClick={() => setShowNewThreadModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateThread}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={newThread.title}
                  onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                  placeholder="Summarize your question or topic"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  value={newThread.content}
                  onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                  placeholder="Provide details about your question..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={newThread.tags}
                  onChange={(e) => setNewThread({...newThread, tags: e.target.value})}
                  placeholder="e.g., algebra, homework, doubt"
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewThreadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .thread-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-md);
          transition: all 0.2s;
          cursor: pointer;
          position: relative;
        }

        .thread-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          border-color: var(--maroon-primary);
        }

        .thread-card.unread {
          background: rgba(128, 0, 0, 0.02);
          border-left: 4px solid var(--maroon-primary);
        }
      `}</style>
    </div>
  );
};

export default DiscussionList;