import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import chatService from '../../services/chatService';

const ClassChat = ({ classId, className }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    setupRealTimeListeners();

    return () => {
      chatService.removeListeners(classId);
    };
  }, [classId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${classId}/messages?limit=50`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeListeners = () => {
    // Poll for new messages
    chatService.startPolling(classId, (type, message) => {
      if (type === 'new') {
        setMessages(prev => {
          // Check if message already exists
          if (!prev.some(m => m.id === message.id)) {
            return [...prev, message];
          }
          return prev;
        });
        
        // Mark as read if visible
        if (message.senderId !== user?.id) {
          chatService.markAsRead(classId, message.id);
        }
      }
    });

    // Listen for typing indicators - FIXED: Use the correct method name
    // Assuming chatService has a method called listenForTyping or similar
    if (chatService.listenForTyping) {
      chatService.listenForTyping(classId, (users) => {
        // Remove current user from typing list
        if (user) {
          const { [user.id]: _, ...others } = users;
          setTypingUsers(others);
        } else {
          setTypingUsers(users);
        }
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    chatService.sendTyping(classId, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      chatService.sendTyping(classId, false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await api.post(`/chat/${classId}/messages`, {
        message: newMessage.trim()
      });
      setNewMessage('');
      
      // Stop typing indicator
      chatService.sendTyping(classId, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For now, just show alert - file upload would need Firebase Storage
    alert('File upload feature coming soon!');
    
    // Clear input
    e.target.value = '';
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      await api.delete(`/chat/${classId}/messages/${messageId}`);
      // FIXED: Update local state to reflect deletion
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: true, message: '[This message has been deleted]' }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="chat-loading" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-xl)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="class-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{className} Chat</h3>
          <span className="chat-status">🟢 Online</span>
        </div>
        <div className="chat-header-actions">
          <button className="btn btn-outline" title="Refresh" onClick={fetchMessages}>
            🔄
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {Object.entries(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="message-group">
              <div className="date-divider">
                <span>{date}</span>
              </div>
              
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === user?.id ? 'own-message' : 'other-message'}`}
                >
                  {message.senderId !== user?.id && (
                    <div className="message-sender">
                      <span className="sender-name">{message.senderName || 'Unknown'}</span>
                      {message.senderRole === 'teacher' && (
                        <span className="teacher-badge">👑 Teacher</span>
                      )}
                    </div>
                  )}
                  
                  <div className="message-content">
                    {message.isDeleted ? (
                      <em style={{ color: 'var(--text-light)' }}>{message.message}</em>
                    ) : (
                      <>
                        {message.messageType === 'text' && (
                          <p>{message.message}</p>
                        )}
                        {message.messageType === 'image' && message.fileUrl && (
                          <img src={message.fileUrl} alt="Shared" className="chat-image" />
                        )}
                        {message.messageType === 'file' && message.fileUrl && (
                          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                            📎 {message.fileName || 'File'}
                          </a>
                        )}
                      </>
                    )}
                    
                    <div className="message-footer">
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                      {message.senderId === user?.id && !message.isDeleted && (
                        <button
                          className="delete-message-btn"
                          onClick={() => handleDeleteMessage(message.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-light)' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Typing Indicator */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="typing-indicator">
            {Object.values(typingUsers).map(u => u.name).join(', ')} typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSendMessage}>
          <div className="input-group">
            <button
              type="button"
              className="attach-btn"
              onClick={handleFileUpload}
              title="Attach file"
            >
              📎
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelected}
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <input
              type="text"
              className="chat-input"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              disabled={sending}
            />
            
            <button
              type="submit"
              className="send-btn"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassChat;