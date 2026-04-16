import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ToastNotification from './ToastNotification';
import '../../styles/Notifications.css';

function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    supabase.from('notifications').select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setNotifications(data ?? []));

    const channel = supabase
      .channel(`notif:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev].slice(0, 5));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true })
      .eq('user_id', userId).eq('read', false);
  }

  return { notifications, unreadCount, markAllAsRead };
}

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

// Map notification type to route/tab
function getDestination(type, userRole) {
  if (userRole === 'student') {
    if (type === 'new_content')  return { tab: 'study', section: 'classes' };
    if (type === 'new_homework') return { tab: 'study', section: 'homework' };
    if (type === 'new_test')     return { tab: 'study', section: 'tests' };
    if (type === 'new_post')     return { tab: 'feed' };
  }
  if (userRole === 'teacher') {
    if (type === 'new_like' || type === 'new_comment') return { section: 'feed' };
  }
  return null;
}

export default function NotificationBell({ userId, userRole, dark = false, dropUp = false, onNavigate }) {
  const { notifications, unreadCount, markAllAsRead } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleNotificationClick(n) {
    const dest = getDestination(n.type, userRole);
    if (dest && onNavigate) onNavigate(dest);
    setOpen(false);
  }

  return (
    <>
      <ToastNotification notifications={notifications} />
      <div className="nb-wrap" ref={ref}>
        <button
          className={`nb-btn ${dark ? 'dark' : ''}`}
          onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllAsRead(); }}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {open && (
          <div className={`nb-dropdown ${dark ? 'dark' : ''} ${dropUp ? 'drop-up' : ''}`}>
            <div className="nb-header">
              <span>Notifications</span>
              <span className="nb-header-sub">Last 5</span>
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
                    onClick={() => handleNotificationClick(n)}
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