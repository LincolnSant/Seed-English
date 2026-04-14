import { useState } from 'react';
import '../../styles/Forms.css';

const TYPES = [
  { value: 'text',      label: '📝 Texto' },
  { value: 'video',     label: '🎬 Vídeo (link)' },
  { value: 'curiosity', label: '💡 Curiosidade' },
  { value: 'history',   label: '🏛️ Fato histórico' },
  { value: 'music',     label: '🎵 Música' },
];

export default function ContentForm({ initial, onSave, onCancel }) {
  const [type,  setType]  = useState(initial?.type  ?? 'text');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body,  setBody]  = useState(initial?.body  ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSave({ id: initial?.id, type, title: title.trim(), body: body.trim() });
  }

  return (
    <form className="ef-form" onSubmit={handleSubmit}>
      <div className="ef-form-title">{initial ? 'Editar conteúdo' : 'Novo conteúdo'}</div>

      <div className="ef-field">
        <label>Tipo</label>
        <div className="ef-type-grid">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              className={`ef-type-btn ${type === t.value ? 'active' : ''}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ef-field">
        <label htmlFor="cf-title">Título</label>
        <input
          id="cf-title"
          type="text"
          placeholder="Ex: The Beatles e o Present Perfect"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="ef-field">
        <label htmlFor="cf-body">
          {type === 'video' ? 'Link do vídeo' : 'Conteúdo'}
        </label>
        {type === 'video' ? (
          <input
            id="cf-body"
            type="url"
            placeholder="https://youtube.com/..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        ) : (
          <textarea
            id="cf-body"
            placeholder="Escreva o conteúdo aqui..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            required
          />
        )}
      </div>

      <div className="ef-form-actions">
        <button type="button" className="ef-btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="ef-btn-save">
          {initial ? 'Salvar alterações' : 'Adicionar conteúdo'}
        </button>
      </div>
    </form>
  );
}