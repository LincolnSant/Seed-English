import '../../styles/StudentContent.css';

const CONTENT_TYPE_LABEL = {
  text:      { icon: '📝', label: 'Texto' },
  video:     { icon: '🎬', label: 'Vídeo' },
  curiosity: { icon: '💡', label: 'Curiosidade' },
  history:   { icon: '🏛️', label: 'Fato histórico' },
  music:     { icon: '🎵', label: 'Música' },
};

function getYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/);
  return match ? match[1] : null;
}

export default function StudentContent({ content, onBack }) {
  const meta = CONTENT_TYPE_LABEL[content.type] ?? { icon: '📄', label: content.type };
  const youtubeId = content.type === 'video' ? getYouTubeId(content.body) : null;

  return (
    <div className="sc-root">
      <div className="sc-inner">

        <button className="sc-back" onClick={onBack}>← Voltar</button>

        <div className="sc-header">
          <span className="sc-type-badge">{meta.icon} {meta.label}</span>
          <h1>{content.title}</h1>
        </div>

        <div className="sc-body">
          {content.type === 'video' ? (
            youtubeId ? (
              <div className="sc-video-wrap">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={content.title}
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
            ) : (
              <a href={content.body} target="_blank" rel="noreferrer" className="sc-link">
                Abrir vídeo →
              </a>
            )
          ) : (
            <p className="sc-text">{content.body}</p>
          )}
        </div>

        <button className="sc-done" onClick={onBack}>← Voltar para o início</button>

      </div>
    </div>
  );
}