import { useState } from 'react';
import '../../styles/StudentContent.css';

const CONTENT_TYPE_LABEL = {
  text:      { icon: '📝', label: 'Texto' },
  video:     { icon: '🎬', label: 'Vídeo' },
  pdf:       { icon: '📄', label: 'PDF' },
  curiosity: { icon: '💡', label: 'Curiosidade' },
  history:   { icon: '🏛️', label: 'Fato histórico' },
  music:     { icon: '🎵', label: 'Música' },
};

function getYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/);
  return match ? match[1] : null;
}

function getDriveEmbedUrl(url) {
  // Formats:
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  // https://docs.google.com/...
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;

  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;

  // Already an embed/preview link
  if (url.includes('/preview')) return url;

  // Docs/Sheets/Slides
  if (url.includes('docs.google.com')) {
    return url.replace(/\/(edit|view).*$/, '/preview');
  }

  return null;
}

export default function StudentContent({ content, onBack }) {
  const [expanded, setExpanded] = useState(false);

  function handlePdfMouseEnter() {
    document.body.style.overflow = 'hidden';
  }
  function handlePdfMouseLeave() {
    document.body.style.overflow = '';
  }
  const meta   = CONTENT_TYPE_LABEL[content.type] ?? { icon: '📄', label: content.type };
  const ytId   = content.type === 'video' ? getYouTubeId(content.body) : null;
  const driveUrl = content.type === 'pdf'  ? getDriveEmbedUrl(content.body) : null;

  return (
    <div className="sc-root">
      <div className="sc-inner">
        <button className="sc-back" onClick={onBack}>← Voltar</button>

        <div className="sc-header">
          <span className="sc-type-badge">{meta.icon} {meta.label}</span>
          <h1>{content.title}</h1>
        </div>

        <div className="sc-body">
          {/* Video */}
          {content.type === 'video' && ytId && (
            <div className="sc-video-wrap">
              <iframe src={`https://www.youtube.com/embed/${ytId}`}
                title={content.title} allowFullScreen frameBorder="0" />
            </div>
          )}
          {content.type === 'video' && !ytId && (
            <a href={content.body} target="_blank" rel="noreferrer" className="sc-link">
              Abrir vídeo →
            </a>
          )}

          {/* PDF via Google Drive embed */}
          {content.type === 'pdf' && driveUrl && (
            <div className="sc-pdf-wrap">
              <div className="sc-pdf-toolbar">
                <a href={content.body} target="_blank" rel="noreferrer" className="sc-pdf-link">
                  📄 Abrir no Google Drive →
                </a>
                <button className="sc-pdf-expand" onClick={() => setExpanded(!expanded)}>
                  {expanded ? '⤓ Recolher' : '⤢ Expandir'}
                </button>
              </div>
              <iframe
                src={driveUrl}
                title={content.title}
                frameBorder="0"
                allowFullScreen
                className={expanded ? 'sc-pdf-iframe expanded' : 'sc-pdf-iframe'}
                onMouseEnter={handlePdfMouseEnter}
                onMouseLeave={handlePdfMouseLeave}
              />
            </div>
          )}
          {content.type === 'pdf' && !driveUrl && (
            <a href={content.body} target="_blank" rel="noreferrer" className="sc-link">
              📄 Abrir PDF →
            </a>
          )}

          {/* Text content */}
          {content.type !== 'video' && content.type !== 'pdf' && (
            <p className="sc-text">{content.body}</p>
          )}
        </div>

        <button className="sc-done" onClick={onBack}>← Voltar para o início</button>
      </div>
    </div>
  );
}