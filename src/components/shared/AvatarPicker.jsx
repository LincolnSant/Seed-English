import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import '../../styles/AvatarPicker.css';

const COLORS = [
  '#5C7A5E', '#1A1612', '#C8956C', '#1A6FA8',
  '#A0522D', '#7B4F9E', '#C0392B', '#2E86AB',
];

export default function AvatarPicker({ profile, onColorChange, onPhotoChange, size = 34, dark = false }) {
  const [showPicker, setShowPicker] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef();

  const avatarColor = profile?.avatar_color ?? '#5C7A5E';
  const avatarPhoto = profile?.avatar_url   ?? null;
  const initials    = (profile?.name ?? '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

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
    <div className="ap-wrap" onClick={() => setShowPicker(!showPicker)}>
      {avatarPhoto ? (
        <img src={avatarPhoto} alt={initials} className="ap-img" style={{ width: size, height: size }} />
      ) : (
        <div className="ap-avatar" style={{ width: size, height: size, background: avatarColor, fontSize: size * 0.38 }}>
          {uploading ? '...' : initials}
        </div>
      )}
      <span className={`ap-edit ${dark ? 'dark' : ''}`}>✏️</span>

      {showPicker && (
        <div className={`ap-picker ${dark ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="ap-picker-label">Cor do avatar</div>
          <div className="ap-colors">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`ap-swatch ${!avatarPhoto && avatarColor === color ? 'active' : ''}`}
                style={{ background: color }}
                onMouseDown={(e) => { e.preventDefault(); handleColorChange(color); }}
              />
            ))}
          </div>
          <button
            className="ap-photo-btn"
            onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
          >
            📷 Usar foto
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*"
        style={{ display: 'none' }} onChange={handlePhotoUpload} />
    </div>
  );
}