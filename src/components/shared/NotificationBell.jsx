import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import ToastNotification from './ToastNotification';
import '../../styles/Notifications.css';

function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    supabase.from('notifications').select('*')
      .eq('user_id', userId).eq('read', false)
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => setNotifications(data ?? []));

    const channel = supabase
      .channel(`notif:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  async function markAsRead(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }

  async function markAllAsRead() {
    setNotifications([]);
    await supabase.from('notifications').update({ read: true })
      .eq('user_id', userId).eq('read', false);
  }

  return { notifications, unreadCount: notifications.length, markAsRead, markAllAsRead };
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

export default function NotificationBell({ userId, dark = false, dropUp = false }) {
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
          <div className={`nb-dropdown ${dark ? 'dark' : ''} ${dropUp ? 'drop-up' : ''}`}>
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
                  <div key={n.id} className="nb-item unread" onClick={() => markAsRead(n.id)}>
                    <div className="nb-item-icon">{TYPE_ICON[n.type] ?? '🔔'}</div>
                    <div className="nb-item-body">
                      <div className="nb-item-title">{n.title}</div>
                      <div className="nb-item-text">{n.body}</div>
                      <div className="nb-item-time">{timeAgo(n.created_at)}</div>
                    </div>
                    <div className="nb-dot" />
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