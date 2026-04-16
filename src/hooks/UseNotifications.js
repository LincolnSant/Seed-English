import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  async function fetchNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    setNotifications(data ?? []);
    setLoading(false);
  }

  async function markAsRead(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }

  async function markAllAsRead() {
    setNotifications([]);
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead };
}

// Helper to create notifications
export async function createNotification(userId, type, title, body) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body });
}