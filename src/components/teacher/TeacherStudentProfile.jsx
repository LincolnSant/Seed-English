import { useState } from 'react';
import ContentForm from './ContentForm';
import QuizForm    from './QuizForm';
import '../../styles/TeacherHome.css';

const CONTENT_TYPE_LABEL = {
  text:      '📝 Texto',
  video:     '🎬 Vídeo',
  curiosity: '💡 Curiosidade',
  history:   '🏛️ Fato histórico',
  music:     '🎵 Música',
};

const LEVELS = ['Básico', 'Intermediário', 'Avançado'];

export default function TeacherStudentProfile({
  student, onBack,
  onSaveContent, onDeleteContent,
  onSaveQuiz,    onDeleteQuiz,
  onUpdateLevel,
}) {
  const [tab,            setTab]            = useState('contents');
  const [showContentForm, setShowContentForm] = useState(false);
  const [showQuizForm,    setShowQuizForm]    = useState(false);
  const [editingContent,  setEditingContent]  = useState(null);
  const [editingQuiz,     setEditingQuiz]     = useState(null);
  const [savingLevel,     setSavingLevel]     = useState(false);

  async function handleSaveContent(content) {
    await onSaveContent(content);
    setShowContentForm(false);
    setEditingContent(null);
  }

  async function handleSaveQuiz(quiz) {
    await onSaveQuiz(quiz);
    setShowQuizForm(false);
    setEditingQuiz(null);
  }

  async function handleLevelChange(level) {
    setSavingLevel(true);
    await onUpdateLevel(level);
    setSavingLevel(false);
  }

  return (
    <div className="tsp-root">
      <button className="tsp-back" onClick={onBack}>← Voltar</button>

      <div className="tsp-header">
        <div className="tsp-student-info">
          <div className="tsp-avatar">{student.initials}</div>
          <div>
            <h1>{student.name}</h1>
            <div className="tsp-meta">
              {/* Level selector */}
              <div className="level-selector-wrap"><span className="level-selector-label">Nível:</span><select
                className={`level-badge level-${(student.level ?? '').toLowerCase()} level-select`}
                value={student.level ?? ''}
                onChange={(e) => handleLevelChange(e.target.value)}
                disabled={savingLevel}
              >
                <option value="">Sem nível</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select></div>
              <span>{student.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tsp-tabs">
        <button className={`tsp-tab ${tab === 'contents' ? 'active' : ''}`} onClick={() => setTab('contents')}>
          📚 Conteúdos ({student.contents?.length ?? 0})
        </button>
        <button className={`tsp-tab ${tab === 'quizzes' ? 'active' : ''}`} onClick={() => setTab('quizzes')}>
          ✏️ Quiz ({student.quizzes?.length ?? 0})
        </button>
      </div>

      {/* CONTENTS */}
      {tab === 'contents' && (
        <div className="tsp-tab-content">
          <div className="tsp-tab-actions">
            <button className="btn-add" onClick={() => { setEditingContent(null); setShowContentForm(true); }}>
              + Novo conteúdo
            </button>
          </div>

          {showContentForm && (
            <ContentForm
              initial={editingContent}
              onSave={handleSaveContent}
              onCancel={() => { setShowContentForm(false); setEditingContent(null); }}
            />
          )}

          {(student.contents?.length === 0 && !showContentForm) && (
            <div className="tsp-empty">Nenhum conteúdo adicionado ainda.</div>
          )}

          <div className="tsp-content-list">
            {(student.contents ?? []).map((c) => (
              <div className="tsp-content-card" key={c.id}>
                <div className="tsp-content-top">
                  <span className="content-type-badge">{CONTENT_TYPE_LABEL[c.type] ?? c.type}</span>
                  <div className="tsp-card-actions">
                    <button onClick={() => { setEditingContent(c); setShowContentForm(true); }}>Editar</button>
                    <button className="btn-danger" onClick={() => onDeleteContent(c.id)}>Excluir</button>
                  </div>
                </div>
                <div className="tsp-content-title">{c.title}</div>
                {c.type === 'video' ? (
                  <a href={c.body} target="_blank" rel="noreferrer" className="tsp-content-link">{c.body}</a>
                ) : (
                  <div className="tsp-content-body">{c.body}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZZES */}
      {tab === 'quizzes' && (
        <div className="tsp-tab-content">
          <div className="tsp-tab-actions">
            <button className="btn-add" onClick={() => { setEditingQuiz(null); setShowQuizForm(true); }}>
              + Novo quiz
            </button>
          </div>

          {showQuizForm && (
            <QuizForm
              initial={editingQuiz}
              onSave={handleSaveQuiz}
              onCancel={() => { setShowQuizForm(false); setEditingQuiz(null); }}
            />
          )}

          {(student.quizzes?.length === 0 && !showQuizForm) && (
            <div className="tsp-empty">Nenhum quiz adicionado ainda.</div>
          )}

          <div className="tsp-content-list">
            {(student.quizzes ?? []).map((q) => (
              <div className="tsp-content-card" key={q.id}>
                <div className="tsp-content-top">
                  <span className="content-type-badge">✏️ {q.questions?.length ?? 0} pergunta(s)</span>
                  <div className="tsp-card-actions">
                    <button onClick={() => { setEditingQuiz(q); setShowQuizForm(true); }}>Editar</button>
                    <button className="btn-danger" onClick={() => onDeleteQuiz(q.id)}>Excluir</button>
                  </div>
                </div>
                <div className="tsp-content-title">{q.title}</div>
                <div className="tsp-quiz-preview">
                  {(q.questions ?? []).map((question, i) => (
                    <div className="tsp-quiz-q" key={i}>
                      <span className="tsp-quiz-num">{i + 1}.</span> {question.prompt}
                      <span className="tsp-quiz-type"> · {question.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}