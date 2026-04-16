import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import ToastNotification from './ToastNotification';
import '../../styles/Notifications.css';

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

const TYPE_ICON = {
  'new_content':  '📚',
  'new_homework': '✏️',
  'new_test':     '📋',
  'new_post':     '📢',
  'new_like':     '❤️',
  'new_comment':  '💬',
};

export default function NotificationBell({ userId, dark = false }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
    <ToastNotification notifications={notifications} />
    <div className="nb-wrap" ref={ref}>
      <button
        className={`nb-btn ${dark ? 'dark' : ''}`}
        onClick={() => setOpen(!open)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={`nb-dropdown ${dark ? 'dark' : ''}`}>
          <div className="nb-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="nb-mark-all" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <div className="nb-empty-icon">🔔</div>
                <div>No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`nb-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="nb-item-icon">{TYPE_ICON[n.type] ?? '🔔'}</div>
                  <div className="nb-item-body">
                    <div className="nb-item-title">{n.title}</div>
                    <div className="nb-item-text">{n.body}</div>
                    <div className="nb-item-time">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <div className="nb-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}