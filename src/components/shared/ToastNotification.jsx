import { useEffect, useState } from 'react';
import '../../styles/Notifications.css';

export default function ToastNotification({ notifications }) {
  const [toasts, setToasts] = useState([]);
  const [shown, setShown] = useState(new Set());

  useEffect(() => {
    const unread = notifications.filter((n) => !n.read && !shown.has(n.id));
    if (unread.length === 0) return;

    const newShown = new Set(shown);
    unread.forEach((n) => newShown.add(n.id));
    setShown(newShown);

    setToasts((prev) => [...prev, ...unread.map((n) => ({ ...n, _visible: true }))]);

    // Auto remove after 4s
    unread.forEach((n) => {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== n.id));
      }, 4000);
    });
  }, [notifications]);

  const TYPE_ICON = {
    'new_content':  '📚',
    'new_homework': '✏️',
    'new_test':     '📋',
    'new_post':     '📢',
    'new_like':     '❤️',
    'new_comment':  '💬',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="toast-item" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
          <div className="toast-icon">{TYPE_ICON[t.type] ?? '🔔'}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            <div className="toast-text">{t.body}</div>
          </div>
          <button className="toast-close">✕</button>
        </div>
      ))}
    </div>
  );
}