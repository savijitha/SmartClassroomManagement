import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import notificationService from "../../services/notificationService"; // ✅ import added

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const pollingRef = useRef(null);

  // ✅ moved inside component
  const lastCheckRef = useRef(Date.now());
  const processedNotificationsRef = useRef({});

  useEffect(() => {
    if (user) {
      fetchNotifications();
      startPolling();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [user]);

  const startPolling = () => {
    pollingRef.current = setInterval(() => {
      checkForNewNotifications();
    }, 10000);
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications?limit=20");

      setNotifications(response.data);

      const unread = response.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const response = await api.get(
        "/notifications?limit=1&since=" + lastCheckRef.current
      );

      const newNotifications = response.data;

      if (newNotifications.length > 0) {
        newNotifications.forEach((notification) => {
          if (!processedNotificationsRef.current[notification.id]) {
            processedNotificationsRef.current[notification.id] = true;

            // popup notification
            notificationService.handleNewNotification(notification);

            setUnreadCount((prev) => prev + 1);
          }
        });

        lastCheckRef.current = Date.now();
      }
    } catch (error) {
      console.error("Failed to check for new notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await api.post(`/notifications/${notification.id}/click`);

      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }

      if (notification.link) {
        navigate(notification.link);
      }

      setShowDropdown(false);
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;

    return "just now";
  };

  if (!user) return null;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-icon"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>

            {unreadCount > 0 && (
              <button
                className="btn btn-outline"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.isRead ? "unread" : ""
                  }`}
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                >
                  <div className="notification-icon-small">
                    {notification.icon}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>

                    <div className="notification-message">
                      {notification.message}
                    </div>

                    <div className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;