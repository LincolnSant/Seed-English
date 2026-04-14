import { useState } from 'react';
import '../../styles/Feed.css';

function getYouTubeId(url) {
  const match = url?.match(/(?:v=|youtu\.be\/|shorts\/)([^&?\s]+)/);
  return match ? match[1] : null;
}

function getInitials(name) {
  return (name ?? '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return 'agora';
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function FeedPost({ post, currentUserId, isTeacher, onToggleLike, onAddComment, onDeleteComment, onDeletePost }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const liked        = post.post_likes?.some((l) => l.user_id === currentUserId);
  const likeCount    = post.post_likes?.length ?? 0;
  const commentCount = post.post_comments?.length ?? 0;
  const ytId         = (post.type === 'video' || post.type === 'mixed') ? getYouTubeId(post.content) : null;

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onAddComment(post.id, commentText.trim());
    setCommentText('');
    setSubmitting(false);
  }

  return (
    <div className="fp-root">
      {/* Header */}
      <div className="fp-header">
        <div className="fp-avatar">{getInitials(post.author?.name)}</div>
        <div className="fp-meta">
          <div className="fp-author">{post.author?.name ?? 'Professora'}</div>
          <div className="fp-time">{timeAgo(post.created_at)}</div>
        </div>
        {(isTeacher || post.author_id === currentUserId) && (
          <button className="fp-delete" onClick={() => onDeletePost(post.id)} title="Excluir">✕</button>
        )}
      </div>

      {/* Text */}
      {post.type === 'text' && post.content && (
        <p className="fp-text">{post.content}</p>
      )}

      {/* Image — shown for image and mixed posts */}
      {(post.type === 'image' || post.type === 'mixed') && post.image_url && (
        <img src={post.image_url} alt="Post" className="fp-image" />
      )}
      {post.type === 'image' && !post.image_url && post.content && (
        <img src={post.content} alt="Post" className="fp-image" />
      )}

      {/* Video — shown for video and mixed posts */}
      {(post.type === 'video' || post.type === 'mixed') && ytId && (
        <div className="fp-video-wrap">
          <iframe src={`https://www.youtube.com/embed/${ytId}`} title="Video" allowFullScreen frameBorder="0" />
        </div>
      )}
      {(post.type === 'video' || post.type === 'mixed') && !ytId && post.content && (
        <a href={post.content} target="_blank" rel="noreferrer" className="fp-link">🎬 Assistir vídeo →</a>
      )}

      {/* Caption */}
      {post.caption && <p className="fp-caption">{post.caption}</p>}

      {/* Actions */}
      <div className="fp-actions">
        <button className={`fp-action-btn ${liked ? 'liked' : ''}`} onClick={() => onToggleLike(post.id)}>
          {liked ? '❤️' : '🤍'} {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <button className={`fp-action-btn ${showComments ? 'active' : ''}`} onClick={() => setShowComments(!showComments)}>
          💬 {commentCount > 0 && <span>{commentCount}</span>}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="fp-comments">
          {commentCount === 0 && <div className="fp-no-comments">Nenhum comentário ainda.</div>}
          {(post.post_comments ?? [])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map((c) => (
              <div className="fp-comment" key={c.id}>
                <div className="fp-comment-avatar">{getInitials(c.author?.name)}</div>
                <div className="fp-comment-body">
                  <div className="fp-comment-author">{c.author?.name}</div>
                  <div className="fp-comment-text">{c.content}</div>
                </div>
                <div className="fp-comment-right">
                  <div className="fp-comment-time">{timeAgo(c.created_at)}</div>
                  {(isTeacher || c.author_id === currentUserId) && (
                    <button className="fp-comment-delete" onClick={() => onDeleteComment(post.id, c.id)}>✕</button>
                  )}
                </div>
              </div>
            ))}
          <form className="fp-comment-form" onSubmit={handleComment}>
            <input type="text" placeholder="Escreva um comentário..."
              value={commentText} onChange={(e) => setCommentText(e.target.value)} disabled={submitting} />
            <button type="submit" disabled={submitting || !commentText.trim()}>
              {submitting ? '...' : '→'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}