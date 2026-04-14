import { useState } from 'react';
import { useFeed }   from '../../hooks/useFeed';
import FeedPost      from '../shared/FeedPost';
import '../../styles/Feed.css';

const POST_TYPES = [
  { value: 'text',  label: '📝 Texto' },
  { value: 'video', label: '🎬 Vídeo (YouTube)' },
  { value: 'image', label: '🖼️ Imagem (link)' },
];

export default function TeacherFeed({ teacherId }) {
  const { posts, loading, createPost, deletePost, toggleLike, addComment, deleteComment } = useFeed(teacherId);

  const [type,       setType]       = useState('text');
  const [content,    setContent]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    await createPost(type, content.trim());
    setContent('');
    setSubmitting(false);
  }

  return (
    <div className="tf-root">
      <div className="tf-header">
        <h1>Feed</h1>
        <p>Publique conteúdos para todos os seus alunos</p>
      </div>

      {/* Compose */}
      <form className="tf-compose" onSubmit={handlePost}>
        <div className="tf-compose-type">
          {POST_TYPES.map((t) => (
            <button type="button" key={t.value}
              className={`tf-type-btn ${type === t.value ? 'active' : ''}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {type === 'text' ? (
          <textarea
            className="tf-textarea"
            placeholder="O que você quer compartilhar com seus alunos?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
        ) : (
          <input
            className="tf-input"
            type="url"
            placeholder={type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://link-da-imagem.com/foto.jpg'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        )}

        <div className="tf-compose-actions">
          <button type="submit" className="tf-post-btn" disabled={submitting || !content.trim()}>
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>

      {/* Feed */}
      <div className="tf-feed">
        {loading ? (
          <div className="feed-loading">
            {[1,2,3].map((i) => <div key={i} className="feed-skeleton-post" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📢</div>
            <div className="feed-empty-title">Nenhuma publicação ainda</div>
            <p>Comece publicando algo para seus alunos!</p>
          </div>
        ) : (
          <div className="feed-list">
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                currentUserId={teacherId}
                isTeacher={true}
                onToggleLike={toggleLike}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
                onDeletePost={deletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}