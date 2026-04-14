import '../../styles/TeacherSidebar.css';

const NAV = [
  { key: 'home',     icon: '⊞', label: 'Visão geral' },
  { key: 'students', icon: '👤', label: 'Alunos' },
  { key: 'feed',     icon: '📢', label: 'Feed' },
];

export default function TeacherSidebar({ active, onChange, onLogout }) {
  return (
    <aside className="ts-root">
      <div className="ts-logo">Seed <span>English</span></div>

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
          <div className="ts-avatar">LP</div>
          <div>
            <div className="ts-profile-name">Lydia Andery</div>
            <div className="ts-profile-role">Professora</div>
          </div>
        </div>
        <button className="ts-logout" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  );
}