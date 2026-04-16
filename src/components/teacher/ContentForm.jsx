import { useState } from 'react';
import '../../styles/Forms.css';

const TYPES = [
  { value: 'text',      label: '📝 Text' },
  { value: 'video',     label: '🎬 Video (link)' },
  { value: 'pdf',       label: '📄 PDF (Google Drive)' },
  { value: 'curiosity', label: '💡 Curiosity' },
  { value: 'history',   label: '🏛️ Historical fact' },
  { value: 'music',     label: '🎵 Music' },
];

export default function ContentForm({ initial, onSave, onCancel }) {
  const [type,  setType]  = useState(initial?.type  ?? 'text');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body,  setBody]  = useState(initial?.body  ?? '');

  const isLink = type === 'video' || type === 'pdf';

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSave({ id: initial?.id, type, title: title.trim(), body: body.trim() });
  }

  return (
    <form className="ef-form" onSubmit={handleSubmit}>
      <div className="ef-form-title">{initial ? 'Edit conteúdo' : 'New class'}</div>

      <div className="ef-field">
        <label>Type</label>
        <div className="ef-type-grid">
          {TYPES.map((t) => (
            <button
              type="button" key={t.value}
              className={`ef-type-btn ${type === t.value ? 'active' : ''}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ef-field">
        <label htmlFor="cf-title">Title</label>
        <input
          id="cf-title" type="text"
          placeholder="Ex: Class 1 — Present Perfect"
          value={title} onChange={(e) => setTitle(e.target.value)} required
        />
      </div>

      <div className="ef-field">
        <label htmlFor="cf-body">
          {type === 'video' ? 'Video link (YouTube)' :
           type === 'pdf'   ? 'Google Drive link' :
           'Content'}
        </label>
        {isLink ? (
          <input
            id="cf-body" type="url"
            placeholder={type === 'pdf' ? 'https://drive.google.com/...' : 'https://youtube.com/...'}
            value={body} onChange={(e) => setBody(e.target.value)} required
          />
        ) : (
          <textarea
            id="cf-body" placeholder="Write content here..."
            value={body} onChange={(e) => setBody(e.target.value)}
            rows={6} required
          />
        )}
        {type === 'pdf' && (
          <div className="ef-hint">
            On Google Drive: click "Share" → "Anyone with the link" → copy the link
          </div>
        )}
      </div>

      <div className="ef-form-actions">
        <button type="button" className="ef-btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="ef-btn-save">
          {initial ? 'Save alterações' : 'Add aula'}
        </button>
      </div>
    </form>
  );
}