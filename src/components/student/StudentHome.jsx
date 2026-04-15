import { useState } from 'react';
import AvatarPicker from '../shared/AvatarPicker';
import '../../styles/StudentHome.css';

const CONTENT_TYPE_LABEL = {
  text:      { icon: '📝', label: 'Texto' },
  video:     { icon: '🎬', label: 'Vídeo' },
  pdf:       { icon: '📄', label: 'PDF' },
  curiosity: { icon: '💡', label: 'Curiosidade' },
  history:   { icon: '🏛️', label: 'Fato histórico' },
  music:     { icon: '🎵', label: 'Música' },
};

export default function StudentHome({ hideTopbar = false, onColorChange, onPhotoChange,
  student, onOpenContent, onOpenQuiz, onOpenTest, onLogout,
  hasCompletedTest, getTestResult,
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const LESSON_TYPES  = ['text', 'pdf'];
  const VIDEO_TYPES   = ['video'];
  const EXTRAS_TYPES  = ['curiosity', 'history', 'music'];

  const lessons = (student.contents ?? []).filter((c) => LESSON_TYPES.includes(c.type));
  const videos  = (student.contents ?? []).filter((c) => VIDEO_TYPES.includes(c.type));
  const extras  = (student.contents ?? []).filter((c) => EXTRAS_TYPES.includes(c.type));

  const classesTabs = [
    { key: 'lessons', label: '📚 Lessons', items: lessons },
    { key: 'videos',  label: '🎬 Videos',  items: videos },
    { key: 'extras',  label: '💡 Extras',  items: extras },
  ];

  const tabs = [
    { key: 'classes',  label: '📚 Classes',  count: student.contents?.length ?? 0 },
    { key: 'homework', label: '✏️ Homework', count: student.quizzes?.length  ?? 0 },
    { key: 'tests',    label: '📋 Tests',    count: student.tests?.length    ?? 0 },
  ];

  const [activeTab,       setActiveTab]       = useState('classes');
  const [activeClassTab,  setActiveClassTab]  = useState('lessons');

  const hwResults  = student.homeworkResults ?? [];
  const tstResults = student.testResults     ?? [];
  const totalDone  = hwResults.length + tstResults.length;
  const avgScore   = totalDone === 0 ? null : Math.round(
    [...hwResults.map((r) => r.score / r.total), ...tstResults.map((r) => r.score / r.total)]
      .reduce((a, b) => a + b, 0) / totalDone * 100
  );

  return (
    <div className="sh-root">
      {!hideTopbar && <header className="sh-topbar">
        <div className="sh-logo">Seed <span>English</span></div>
        <div className="sh-topbar-right">
          <div className="sh-user">
            <AvatarPicker
              profile={student}
              onColorChange={onColorChange}
              onPhotoChange={onPhotoChange}
              size={32}
              dark={false}
            />
            <span>{student.name}</span>
          </div>
          <button className="sh-logout" onClick={onLogout}>Sair</button>
        </div>
      </header>}

      <div className="sh-body">
        {/* Hero */}
        <div className="sh-hero">
          <div className="sh-hero-text">
            <h1>{greeting}, {student.name?.split(' ')[0]}!</h1>
            <p>Bem-vindo de volta. O que vamos estudar hoje?</p>
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

        {/* Tabs */}
        <div className="sh-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`sh-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className="sh-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* CLASSES */}
        {activeTab === 'classes' && (
          <div className="sh-tab-content">
            {(student.contents?.length ?? 0) === 0 ? (
              <div className="sh-empty">
                <div className="sh-empty-icon">📭</div>
                <div className="sh-empty-title">Nenhuma aula ainda</div>
                <p>Sua professora ainda não adicionou aulas para você.</p>
              </div>
            ) : (
              <>
                {/* Sub-tabs */}
                <div className="sh-subtabs">
                  {classesTabs.map((t) => (
                    <button
                      key={t.key}
                      className={`sh-subtab ${activeClassTab === t.key ? 'active' : ''}`}
                      onClick={() => setActiveClassTab(t.key)}
                    >
                      {t.label}
                      <span className="sh-subtab-count">{t.items.length}</span>
                    </button>
                  ))}
                </div>

                {classesTabs.map((t) => activeClassTab === t.key && (
                  <div key={t.key} className="sh-cards">
                    {t.items.length === 0 ? (
                      <div className="sh-empty" style={{ padding: '32px 0' }}>
                        <p>Nenhum conteúdo nesta categoria ainda.</p>
                      </div>
                    ) : (
                      t.items.map((c) => {
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
                      })
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* HOMEWORK */}
        {activeTab === 'homework' && (
          <div className="sh-tab-content">
            {(student.quizzes?.length ?? 0) === 0 ? (
              <div className="sh-empty">
                <div className="sh-empty-icon">✏️</div>
                <div className="sh-empty-title">Nenhum homework ainda</div>
                <p>Sua professora ainda não adicionou homeworks para você.</p>
              </div>
            ) : (
              <div className="sh-cards">
                {student.quizzes.map((q) => {
                  const results = hwResults.filter((r) => r.quiz_id === q.id);
                  const last    = results[0];
                  return (
                    <button key={q.id} className="sh-card sh-card-quiz" onClick={() => onOpenQuiz(q)}>
                      <div className="sh-card-icon">✏️</div>
                      <div className="sh-card-body">
                        <div className="sh-card-type">{q.questions?.length ?? 0} questão(ões)</div>
                        <div className="sh-card-title">{q.title}</div>
                        {last && (
                          <div className="sh-card-score">
                            Última: {last.score}/{last.total} ({Math.round(last.score / last.total * 100)}%)
                          </div>
                        )}
                      </div>
                      <div className="sh-card-arrow">→</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TESTS */}
        {activeTab === 'tests' && (
          <div className="sh-tab-content">
            {(student.tests?.length ?? 0) === 0 ? (
              <div className="sh-empty">
                <div className="sh-empty-icon">📋</div>
                <div className="sh-empty-title">Nenhum test ainda</div>
                <p>Sua professora ainda não adicionou tests para você.</p>
              </div>
            ) : (
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
                        <div className="sh-card-type">
                          {t.questions?.length ?? 0} questão(ões) · {done ? 'Realizado' : 'Uma tentativa'}
                        </div>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}