import { useFeed } from '../../hooks/useFeed';
import FeedPost    from '../shared/FeedPost';
import '../../styles/Feed.css';

export default function StudentFeed({ student, onLogout, hideTopbar = false }) {
  const { posts, loading, toggleLike, addComment, deleteComment } = useFeed(student.id);

  return (
    <div className="sh-root">
      {!hideTopbar && <header className="sh-topbar">
        <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="sh-logo-img" />
        <div className="sh-topbar-right">
          <div className="sh-user">
            <div className="sh-avatar">{student.initials}</div>
            <span>{student.name}</span>
          </div>
          <button className="sh-logout" onClick={onLogout}>Log out</button>
        </div>
      </header>}

      <div className="feed-body">
        <div className="feed-header">
          <h2>Feed</h2>
          <p>Posts from your teacher</p>
        </div>

        {loading ? (
          <div className="feed-loading">
            {[1,2,3].map((i) => <div key={i} className="feed-skeleton-post" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📢</div>
            <div className="feed-empty-title">No posts yet</div>
            <p>Your teacher hasn't posted anything yet.</p>
          </div>
        ) : (
          <div className="feed-list">
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                currentUserId={student.id}
                isTeacher={false}
                onToggleLike={toggleLike}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
                onDeletePost={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}