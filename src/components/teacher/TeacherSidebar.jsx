import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import '../../styles/TeacherSidebar.css';

const NAV = [
  { key: 'home',     icon: '⊞', label: 'Visão geral' },
  { key: 'students', icon: '👤', label: 'Alunos' },
  { key: 'feed',     icon: '📢', label: 'Feed' },
];

const AVATAR_COLORS = [
  '#5C7A5E', '#1A1612', '#C8956C', '#1A6FA8',
  '#A0522D', '#7B4F9E', '#C0392B', '#2E86AB',
];

export default function TeacherSidebar({ active, onChange, onLogout, profile, onColorChange, onPhotoChange }) {
  const [showPicker, setShowPicker]   = useState(false);
  const [uploading,  setUploading]    = useState(false);
  const fileRef = useRef();

  const avatarColor = profile?.avatar_color ?? '#5C7A5E';
  const avatarPhoto = profile?.avatar_url   ?? null;
  const initials    = (profile?.name ?? 'LP').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  async function handleColorChange(color) {
    setShowPicker(false);
    onColorChange?.(color);
    await supabase.from('profiles')
      .update({ avatar_color: color, avatar_url: null })
      .eq('id', profile?.id);
    onPhotoChange?.(null);
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploading(true);
    setShowPicker(false);

    const ext  = file.name.split('.').pop();
    const path = `avatars/${profile.id}.${ext}`;

    await supabase.storage.from('post-images').remove([path]);
    const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      onPhotoChange?.(publicUrl);
    }
    setUploading(false);
  }

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
          <div className="ts-avatar-wrap" onClick={() => setShowPicker(!showPicker)}>
            {avatarPhoto ? (
              <img src={avatarPhoto} alt={initials} className="ts-avatar-img" />
            ) : (
              <div className="ts-avatar" style={{ background: avatarColor }}>
                {uploading ? '...' : initials}
              </div>
            )}
            <span className="ts-avatar-edit">✏️</span>

            {showPicker && (
              <div className="ts-color-picker" onClick={(e) => e.stopPropagation()}>
                <div className="ts-color-picker-header">Cor do avatar</div>
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`ts-color-swatch ${!avatarPhoto && avatarColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onMouseDown={(e) => { e.preventDefault(); handleColorChange(color); }}
                  />
                ))}
                <button
                  className="ts-upload-btn"
                  onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
                >
                  📷 Usar foto
                </button>
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />
    </aside>
  );
}