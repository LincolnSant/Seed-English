import '../../styles/StudentHome.css';

const CONTENT_TYPE_LABEL = {
  text:      { icon: '📝', label: 'Texto' },
  video:     { icon: '🎬', label: 'Vídeo' },
  curiosity: { icon: '💡', label: 'Curiosidade' },
  history:   { icon: '🏛️', label: 'Fato histórico' },
  music:     { icon: '🎵', label: 'Música' },
};

export default function StudentHome({ student, onOpenContent, onOpenQuiz, onLogout }) {
  const totalItems   = student.contents.length + student.quizzes.length;
  const quizCount    = student.quizzes.length;
  const contentCount = student.contents.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="sh-root">

      {/* Top bar */}
      <header className="sh-topbar">
        <div className="sh-logo">Seed <span>English</span></div>
        <div className="sh-topbar-right">
          <div className="sh-user">
            <div className="sh-avatar">{student.initials}</div>
            <span>{student.name}</span>
          </div>
          <button className="sh-logout" onClick={onLogout}>Sair</button>
        </div>
      </header>

      <div className="sh-body">

        {/* Hero greeting */}
        <div className="sh-hero">
          <div className="sh-hero-text">
            <h1>{greeting}, {student.name.split(' ')[0]}!</h1>
            <p>Você tem <strong>{totalItems} itens</strong> disponíveis. Escolha por onde começar.</p>
          </div>
          <div className="sh-level-badge">{student.level}</div>
        </div>

        {/* Stats row */}
        <div className="sh-stats">
          <div className="sh-stat">
            <div className="sh-stat-num">{contentCount}</div>
            <div className="sh-stat-label">Conteúdos</div>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <div className="sh-stat-num">{quizCount}</div>
            <div className="sh-stat-label">Quiz</div>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <div className="sh-stat-num">{student.level}</div>
            <div className="sh-stat-label">Seu nível</div>
          </div>
        </div>

        {/* Contents */}
        {student.contents.length > 0 && (
          <section className="sh-section">
            <div className="sh-section-title">📚 Conteúdos</div>
            <div className="sh-cards">
              {student.contents.map((c) => {
                const meta = CONTENT_TYPE_LABEL[c.type] ?? { icon: '📄', label: c.type };
                return (
                  <button
                    key={c.id}
                    className="sh-card"
                    onClick={() => onOpenContent(c)}
                  >
                    <div className="sh-card-icon">{meta.icon}</div>
                    <div className="sh-card-body">
                      <div className="sh-card-type">{meta.label}</div>
                      <div className="sh-card-title">{c.title}</div>
                    </div>
                    <div className="sh-card-arrow">→</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Quizzes */}
        {student.quizzes.length > 0 && (
          <section className="sh-section">
            <div className="sh-section-title">✏️ Quiz</div>
            <div className="sh-cards">
              {student.quizzes.map((q) => (
                <button
                  key={q.id}
                  className="sh-card sh-card-quiz"
                  onClick={() => onOpenQuiz(q)}
                >
                  <div className="sh-card-icon">✏️</div>
                  <div className="sh-card-body">
                    <div className="sh-card-type">{q.questions.length} pergunta(s)</div>
                    <div className="sh-card-title">{q.title}</div>
                  </div>
                  <div className="sh-card-arrow">→</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalItems === 0 && (
          <div className="sh-empty">
            <div className="sh-empty-icon">📭</div>
            <div className="sh-empty-title">Nenhum conteúdo ainda</div>
            <p>Sua professora ainda não adicionou conteúdos para você. Volte em breve!</p>
          </div>
        )}

      </div>
    </div>
  );
}