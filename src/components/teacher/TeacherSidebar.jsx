import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import '../../styles/TeacherSidebar.css';

const NAV = [
  { key: 'home',     icon: '⊞', label: 'Visão geral' },
  { key: 'students', icon: '👤', label: 'Alunos' },
  { key: 'feed',     icon: '📢', label: 'Feed' },
];

const AVATAR_COLORS = [
  '#5C7A5E', // sage (default)
  '#1A1612', // ink
  '#C8956C', // warm
  '#1A6FA8', // blue
  '#A0522D', // brown
  '#7B4F9E', // purple
  '#C0392B', // red
  '#2E86AB', // teal
];

export default function TeacherSidebar({ active, onChange, onLogout, profile, onColorChange }) {
  const [showColors, setShowColors] = useState(false);
  const avatarColor = profile?.avatar_color ?? '#5C7A5E';

  async function handleColorChange(color) {
    setShowColors(false);
    onColorChange?.(color);
    await supabase.from('profiles').update({ avatar_color: color }).eq('id', profile?.id);
  }

  const initials = (profile?.name ?? 'LP').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

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
          <div className="ts-avatar-wrap" onClick={() => setShowColors(!showColors)}>
            <div className="ts-avatar" style={{ background: avatarColor }}>
              {initials}
            </div>
            <span className="ts-avatar-edit">✏️</span>
            {showColors && (
              <div className="ts-color-picker">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`ts-color-swatch ${avatarColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onMouseDown={(e) => { e.preventDefault(); handleColorChange(color); }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="ts-profile-name">{profile?.name ?? 'Professora'}</div>
            <div className="ts-profile-role">Professora</div>
          </div>
        </div>
        <button className="ts-logout" onClick={onLogout}>Sair</button>
      </div>
    </aside>
  );
}