import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useFeed(currentUserId) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (currentUserId) fetchPosts(); }, [currentUserId]);

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

  async function createPost(type, content) {
    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: currentUserId, type, content })
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
      }
    }
  }

  async function addComment(postId, content) {
    const { data } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: currentUserId, content })
      .select(`
        id, content, created_at,
        author:profiles!post_comments_author_id_fkey(id, name)
      `)
      .single();
    if (data) {
      setPosts((prev) => prev.map((p) =>
        p.id !== postId ? p : { ...p, post_comments: [...(p.post_comments ?? []), data] }
      ));
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