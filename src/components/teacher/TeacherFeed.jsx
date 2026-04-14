import { useState, useRef } from 'react';
import { useFeed }   from '../../hooks/useFeed';
import FeedPost      from '../shared/FeedPost';
import { supabase }  from '../../lib/supabase';
import '../../styles/Feed.css';

function getInitials(name) {
  return (name ?? '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function TeacherFeed({ teacherId, teacherName }) {
  const { posts, loading, createPost, deletePost, toggleLike, addComment, deleteComment } = useFeed(teacherId);

  const [text,        setText]        = useState('');
  const [caption,     setCaption]     = useState('');
  const [videoUrl,    setVideoUrl]    = useState('');
  const [mode,        setMode]        = useState('text'); // 'text' | 'image' | 'video'
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const fileRef = useRef();

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setText(''); setCaption(''); setVideoUrl('');
    setImageFile(null); setImagePreview(null);
    setMode('text');
  }

  async function handlePost() {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (mode === 'text') {
        if (!text.trim()) return;
        await createPost('text', text.trim(), null, null);

      } else if (mode === 'image') {
        if (!imageFile) return;
        // Upload to Supabase Storage
        const ext      = imageFile.name.split('.').pop();
        const path     = `${teacherId}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('post-images').upload(path, imageFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        await createPost('image', publicUrl, caption.trim() || null, null);

      } else if (mode === 'video') {
        if (!videoUrl.trim()) return;
        await createPost('video', videoUrl.trim(), caption.trim() || null, null);
      }
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  const canPost = mode === 'text'  ? text.trim().length > 0
               : mode === 'image' ? !!imageFile
               : videoUrl.trim().length > 0;

  return (
    <div className="tf-root">
      <div className="tf-header">
        <h1>Feed</h1>
        <p>Publique conteúdos para todos os seus alunos</p>
      </div>

      {/* Twitter-style compose */}
      <div className="tf-compose-twitter">
        <div className="tf-compose-avatar">{getInitials(teacherName)}</div>
        <div className="tf-compose-right">

          {/* Text area always visible */}
          <textarea
            className="tf-compose-textarea"
            placeholder="O que você quer compartilhar?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />

          {/* Image preview */}
          {mode === 'image' && imagePreview && (
            <div className="tf-image-preview-wrap">
              <img src={imagePreview} alt="preview" className="tf-image-preview" />
              <button className="tf-remove-image" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕</button>
            </div>
          )}

          {/* Video URL input */}
          {mode === 'video' && (
            <input
              className="tf-caption-input"
              type="url"
              placeholder="Cole o link do YouTube aqui..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          )}

          {/* Caption — only for image/video */}
          {(mode === 'image' || mode === 'video') && (
            <input
              className="tf-caption-input"
              type="text"
              placeholder="Adicionar legenda (opcional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          )}

          {/* Bottom toolbar */}
          <div className="tf-toolbar">
            <div className="tf-toolbar-actions">
              <button
                className={`tf-toolbar-btn ${mode === 'image' ? 'active' : ''}`}
                onClick={() => { setMode(mode === 'image' ? 'text' : 'image'); fileRef.current?.click(); }}
                title="Adicionar foto"
              >
                🖼️
              </button>
              <button
                className={`tf-toolbar-btn ${mode === 'video' ? 'active' : ''}`}
                onClick={() => setMode(mode === 'video' ? 'text' : 'video')}
                title="Adicionar vídeo"
              >
                🎬
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
            </div>
            <button
              className="tf-post-btn"
              onClick={handlePost}
              disabled={submitting || !canPost}
            >
              {submitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>

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