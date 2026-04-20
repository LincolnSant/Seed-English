import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

async function createNotification(userId, type, title, body) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body });
}

export function useFeed(currentUserId) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    fetchPosts();

    // Realtime — aparece novo post sem F5
    const channel = supabase
      .channel(`feed:${currentUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUserId]);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, name),
        post_likes(id, user_id),
        post_comments(
          id, content, created_at,
          author:profiles!post_comments_author_id_fkey(id, name)
        )
      `)
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  async function createPost(type, content, caption = null, imageUrl = null) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: currentUserId, type, content, caption, image_url: imageUrl })
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, name),
        post_likes(id, user_id),
        post_comments(
          id, content, created_at,
          author:profiles!post_comments_author_id_fkey(id, name)
        )
      `)
      .single();
    if (error) throw error;
    setPosts((prev) => [data, ...prev]);

    // Notify all students
    const { data: students } = await supabase
      .from('profiles').select('id').eq('role', 'student');
    if (students) {
      await Promise.all(students.map((s) =>
        createNotification(s.id, 'new_post', '📢 New post!', 'Your teacher made a new post. Check the feed!')
      ));
    }
  }

  async function deletePost(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    await supabase.from('posts').delete().eq('id', postId);
  }

  async function toggleLike(postId) {
    const post     = posts.find((p) => p.id === postId);
    const existing = post?.post_likes?.find((l) => l.user_id === currentUserId);
    if (existing) {
      setPosts((prev) => prev.map((p) =>
        p.id !== postId ? p : { ...p, post_likes: p.post_likes.filter((l) => l.user_id !== currentUserId) }
      ));
      await supabase.from('post_likes').delete().eq('id', existing.id);
    } else {
      const { data } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: currentUserId })
        .select().single();
      if (data) {
        setPosts((prev) => prev.map((p) =>
          p.id !== postId ? p : { ...p, post_likes: [...(p.post_likes ?? []), data] }
        ));
        // Notify post author
        const post = posts.find((p) => p.id === postId);
        if (post && post.author_id !== currentUserId) {
          const { data: liker } = await supabase.from('profiles').select('name').eq('id', currentUserId).single();
          await createNotification(post.author_id, 'new_like', 'New like on your post',
            `${liker?.name ?? 'A student'} liked your post.`);
        }
      }
    }
  }

  async function addComment(postId, content) {
    const { data } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: currentUserId, content })
      .select(`id, content, created_at, author:profiles!post_comments_author_id_fkey(id, name)`)
      .single();
    if (data) {
      setPosts((prev) => prev.map((p) =>
        p.id !== postId ? p : { ...p, post_comments: [...(p.post_comments ?? []), data] }
      ));
      // Notify post author
      const post = posts.find((p) => p.id === postId);
      if (post && post.author_id !== currentUserId) {
        const { data: commenter } = await supabase.from('profiles').select('name').eq('id', currentUserId).single();
        await createNotification(post.author_id, 'new_comment', 'New comment on your post',
          `${commenter?.name ?? 'A student'} commented: "${content.slice(0, 60)}"`);
      }
    }
  }

  async function deleteComment(postId, commentId) {
    setPosts((prev) => prev.map((p) =>
      p.id !== postId ? p : { ...p, post_comments: p.post_comments.filter((c) => c.id !== commentId) }
    ));
    await supabase.from('post_comments').delete().eq('id', commentId);
  }

  return { posts, loading, createPost, deletePost, toggleLike, addComment, deleteComment, refetch: fetchPosts };
}