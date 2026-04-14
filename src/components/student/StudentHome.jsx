import '../../styles/StudentHome.css';

const CONTENT_TYPE_LABEL = {
  text:      { icon: '📝', label: 'Texto' },
  video:     { icon: '🎬', label: 'Vídeo' },
  pdf:       { icon: '📄', label: 'PDF' },
  curiosity: { icon: '💡', label: 'Curiosidade' },
  history:   { icon: '🏛️', label: 'Fato histórico' },
  music:     { icon: '🎵', label: 'Música' },
};

export default function StudentHome({
  student, onOpenContent, onOpenQuiz, onOpenTest, onLogout,
  hasCompletedTest, getTestResult,
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const totalItems = (student.contents?.length ?? 0) +
                     (student.quizzes?.length  ?? 0) +
                     (student.tests?.length    ?? 0);

  // Score geral de homework
  const hwResults  = student.homeworkResults ?? [];
  const tstResults = student.testResults     ?? [];
  const totalDone  = hwResults.length + tstResults.length;
  const avgScore   = totalDone === 0 ? null : Math.round(
    [...hwResults.map((r) => r.score / r.total), ...tstResults.map((r) => r.score / r.total)]
      .reduce((a, b) => a + b, 0) / totalDone * 100
  );

  return (
    <div className="sh-root">
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
        <div className="sh-hero">
          <div className="sh-hero-text">
            <h1>{greeting}, {student.name?.split(' ')[0]}!</h1>
            <p>Você tem <strong>{totalItems} itens</strong> disponíveis. Escolha por onde começar.</p>
          </div>
          {student.level && <div className="sh-level-badge">{student.level}</div>}
        </div>

        {/* Stats */}
        <div className="sh-stats">
          <div className="sh-stat">
            <div className="sh-stat-num">{student.contents?.length ?? 0}</div>
            <div className="sh-stat-label">Classes</div>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <div className="sh-stat-num">{student.quizzes?.length ?? 0}</div>
            <div className="sh-stat-label">Homeworks</div>
          </div>
          <div className="sh-stat-divider" />
          <div className="sh-stat">
            <div className="sh-stat-num">{student.tests?.length ?? 0}</div>
            <div className="sh-stat-label">Tests</div>
          </div>
          {avgScore !== null && (
            <>
              <div className="sh-stat-divider" />
              <div className="sh-stat">
                <div className="sh-stat-num">{avgScore}%</div>
                <div className="sh-stat-label">Média geral</div>
              </div>
            </>
          )}
        </div>

        {/* Classes */}
        {(student.contents?.length ?? 0) > 0 && (
          <section className="sh-section">
            <div className="sh-section-title">📚 Classes</div>
            <div className="sh-cards">
              {student.contents.map((c) => {
                const meta = CONTENT_TYPE_LABEL[c.type] ?? { icon: '📄', label: c.type };
                return (
                  <button key={c.id} className="sh-card" onClick={() => onOpenContent(c)}>
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

        {/* Homework */}
        {(student.quizzes?.length ?? 0) > 0 && (
          <section className="sh-section">
            <div className="sh-section-title">✏️ Homework</div>
            <div className="sh-cards">
              {student.quizzes.map((q) => {
                const results = (student.homeworkResults ?? []).filter((r) => r.quiz_id === q.id);
                const last    = results[0];
                return (
                  <button key={q.id} className="sh-card sh-card-quiz" onClick={() => onOpenQuiz(q)}>
                    <div className="sh-card-icon">✏️</div>
                    <div className="sh-card-body">
                      <div className="sh-card-type">{q.questions?.length ?? 0} questão(ões)</div>
                      <div className="sh-card-title">{q.title}</div>
                      {last && (
                        <div className="sh-card-score">
                          Última: {last.score}/{last.total} ({Math.round(last.score/last.total*100)}%)
                        </div>
                      )}
                    </div>
                    <div className="sh-card-arrow">→</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Tests */}
        {(student.tests?.length ?? 0) > 0 && (
          <section className="sh-section">
            <div className="sh-section-title">📋 Tests</div>
            <div className="sh-cards">
              {student.tests.map((t) => {
                const done   = hasCompletedTest(t.id);
                const result = getTestResult(t.id);
                return (
                  <button
                    key={t.id}
                    className={`sh-card sh-card-test ${done ? 'sh-card-done' : ''}`}
                    onClick={() => onOpenTest(t)}
                  >
                    <div className="sh-card-icon">📋</div>
                    <div className="sh-card-body">
                      <div className="sh-card-type">{t.questions?.length ?? 0} questão(ões) · {done ? 'Realizado' : 'Uma tentativa'}</div>
                      <div className="sh-card-title">{t.title}</div>
                      {result && (
                        <div className="sh-card-score sh-card-score-test">
                          Nota: {result.grade}/10 · {result.score}/{result.total} acertos
                        </div>
                      )}
                    </div>
                    <div className="sh-card-arrow">{done ? '✓' : '→'}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

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