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

  const [text,         setText]         = useState('');
  const [caption,      setCaption]      = useState('');
  const [videoUrl,     setVideoUrl]     = useState('');
  const [showVideo,    setShowVideo]    = useState(false);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const fileRef = useRef();

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function toggleVideo() {
    setShowVideo((v) => !v);
    if (showVideo) setVideoUrl('');
  }

  function resetForm() {
    setText(''); setCaption(''); setVideoUrl('');
    setImageFile(null); setImagePreview(null);
    setShowVideo(false);
  }

  // Determine post type based on what's attached
  function getPostType() {
    if (imageFile && videoUrl.trim()) return 'mixed';
    if (imageFile)       return 'image';
    if (videoUrl.trim()) return 'video';
    return 'text';
  }

  const hasMedia  = !!imageFile || (showVideo && videoUrl.trim());
  const canPost   = text.trim().length > 0 || hasMedia;

  async function handlePost() {
    if (submitting || !canPost) return;
    setSubmitting(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const ext  = imageFile.name.split('.').pop();
        const path = `${teacherId}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('post-images').upload(path, imageFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const type    = getPostType();
      const content = type === 'text' ? text.trim()
                    : type === 'image' ? imageUrl
                    : type === 'video' ? videoUrl.trim()
                    : videoUrl.trim(); // mixed — video is main content

      await createPost(type, content, caption.trim() || text.trim() || null, imageUrl);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tf-root">
      <div className="tf-header">
        <h1>Feed</h1>
        <p>Post content for all your students</p>
      </div>

      {/* Compose */}
      <div className="tf-compose-twitter">
        <div className="tf-compose-avatar" style={{ background: '#3CBBA8' }}>
          {getInitials(teacherName)}
        </div>
        <div className="tf-compose-right">

          <textarea
            className="tf-compose-textarea"
            placeholder="What do you want to share?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="tf-image-preview-wrap">
              <img src={imagePreview} alt="preview" className="tf-image-preview" />
              <button className="tf-remove-image" onClick={removeImage}>✕</button>
            </div>
          )}

          {/* Video URL */}
          {showVideo && (
            <div className="tf-video-input-wrap">
              <span className="tf-video-icon">🎬</span>
              <input
                className="tf-video-input"
                type="url"
                placeholder="Paste YouTube link here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <button className="tf-remove-video" onClick={toggleVideo}>✕</button>
            </div>
          )}

          {/* Caption — only when has media */}
          {(imagePreview || showVideo) && (
            <input
              className="tf-caption-input"
              type="text"
              placeholder="Add legenda (opcional)..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          )}

          {/* Toolbar */}
          <div className="tf-toolbar">
            <div className="tf-toolbar-actions">
              <button
                className={`tf-toolbar-btn ${imagePreview ? 'active' : ''}`}
                onClick={() => fileRef.current?.click()}
                title="Add foto"
              >
                🖼️
              </button>
              <button
                className={`tf-toolbar-btn ${showVideo ? 'active' : ''}`}
                onClick={toggleVideo}
                title="Add vídeo"
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
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="tf-feed">
        {loading ? (
          <div className="feed-loading">
            {[1,2,3].map((i) => <div key={i} className="feed-skeleton-post" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📢</div>
            <div className="feed-empty-title">No posts yet</div>
            <p>Start posting something for your students!</p>
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