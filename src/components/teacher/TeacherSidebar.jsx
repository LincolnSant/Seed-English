import AvatarPicker from '../shared/AvatarPicker';
import '../../styles/TeacherSidebar.css';

const NAV = [
  { key: 'home',     icon: '⊞', label: 'Overview' },
  { key: 'students', icon: '👤', label: 'Students' },
  { key: 'feed',     icon: '📢', label: 'Feed' },
];

export default function TeacherSidebar({ active, onChange, onLogout, profile, onColorChange, onPhotoChange }) {
  return (
    <aside className="ts-root">
      <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="ts-logo-img" />

      <nav className="ts-nav">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`ts-nav-item ${active === item.key || (active === 'student-profile' && item.key === 'students') ? 'active' : ''}`}
            onClick={() => onChange(item.key)}
          >
            <span className="ts-nav-icon">{item.icon}</span>
            <span className="ts-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="ts-bottom">
        <div className="ts-profile">
          <AvatarPicker
            profile={profile}
            onColorChange={onColorChange}
            onPhotoChange={onPhotoChange}
            size={34}
            dark={true}
            dropUp={true}
          />
          <div>
            <div className="ts-profile-name">{profile?.name ?? 'Teacher'}</div>
            <div className="ts-profile-role">Teacher</div>
          </div>
        </div>
        <button className="ts-logout" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}