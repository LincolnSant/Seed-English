import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import ContentForm from './ContentForm';
import QuizForm    from './QuizForm';
import TestForm    from './TestForm';
import '../../styles/TeacherHome.css';

const CONTENT_TYPE_LABEL = {
  text:      '📝 Texto',
  video:     '🎬 Vídeo',
  pdf:       '📄 PDF',
  curiosity: '💡 Curiosidade',
  history:   '🏛️ Fato histórico',
  music:     '🎵 Música',
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export default function TeacherStudentProfile({
  student, onBack,
  onSaveContent, onDeleteContent,
  onSaveQuiz,    onDeleteQuiz,
  onSaveTest,    onDeleteTest,
  onUpdateLevel,
}) {
  const [tab,             setTab]             = useState('classes');
  const [showContentForm, setShowContentForm] = useState(false);
  const [showQuizForm,    setShowQuizForm]    = useState(false);
  const [showTestForm,    setShowTestForm]    = useState(false);
  const [editingContent,  setEditingContent]  = useState(null);
  const [editingQuiz,     setEditingQuiz]     = useState(null);
  const [editingTest,     setEditingTest]     = useState(null);
  const [levelOpen,       setLevelOpen]       = useState(false);
  const [savingLevel,     setSavingLevel]     = useState(false);

  async function handleSaveContent(content) {
    await onSaveContent(content);
    setShowContentForm(false); setEditingContent(null);
  }
  async function handleSaveQuiz(quiz) {
    await onSaveQuiz(quiz);
    setShowQuizForm(false); setEditingQuiz(null);
  }
  async function handleSaveTest(test) {
    await onSaveTest(test);
    setShowTestForm(false); setEditingTest(null);
  }
  async function handleLevelChange(level) {
    setSavingLevel(true); setLevelOpen(false);
    await onUpdateLevel(level); setSavingLevel(false);
  }

  const [detailData,    setDetailData]    = useState(null); // {title, questions, answers}
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function openDetail(type, id, title, questions) {
    setLoadingDetail(true);
    const field = type === 'quiz' ? 'quiz_id' : 'test_id';
    const { data } = await supabase
      .from('result_answers')
      .select('*')
      .eq('student_id', student.id)
      .eq(field, id)
      .order('created_at', { ascending: false });

    // Get only the most recent attempt (by question_id uniqueness)
    const seen = new Set();
    const latest = (data ?? []).filter((a) => {
      if (seen.has(a.question_id)) return false;
      seen.add(a.question_id);
      return true;
    });

    setDetailData({ title, questions, answers: latest });
    setLoadingDetail(false);
  }

  const hwResults  = student.homework_results ?? [];
  const tstResults = student.test_results     ?? [];

  return (
    <div className="tsp-root">
      <button className="tsp-back" onClick={onBack}>← Voltar</button>

      <div className="tsp-header">
        <div className="tsp-student-info">
          <div className="tsp-avatar">{student.initials}</div>
          <div>
            <h1>{student.name}</h1>
            <div className="tsp-meta">
              <div className="level-selector-wrap">
                <span className="level-selector-label">Nível:</span>
                <div className="level-dropdown">
                  <button
                    className={`level-dropdown-btn level-${(student.level ?? 'sem').toLowerCase()}`}
                    onClick={() => setLevelOpen(!levelOpen)}
                    onBlur={() => setTimeout(() => setLevelOpen(false), 150)}
                    disabled={savingLevel}
                  >
                    {student.level ?? 'No level'}
                    <span className="level-dropdown-arrow">▾</span>
                  </button>
                  {levelOpen && (
                    <div className="level-dropdown-menu">
                      <button onMouseDown={(e) => { e.preventDefault(); handleLevelChange(''); }}>No level</button>
                      {LEVELS.map((l) => (
                        <button key={l}
                          className={student.level === l ? 'active' : ''}
                          onMouseDown={(e) => { e.preventDefault(); handleLevelChange(l); }}
                        >{l}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span>{student.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tsp-tabs">
        {[
          { key: 'classes',     label: `📚 Classes (${student.contents?.length ?? 0})` },
          { key: 'homework',    label: `✏️ Homework (${student.quizzes?.length ?? 0})` },
          { key: 'test',        label: `📋 Test (${student.tests?.length ?? 0})` },
          { key: 'performance', label: `📊 Desempenho` },
        ].map((t) => (
          <button key={t.key}
            className={`tsp-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* CLASSES */}
      {tab === 'classes' && (
        <div className="tsp-tab-content">
          <div className="tsp-tab-actions">
            <button className="btn-add" onClick={() => { setEditingContent(null); setShowContentForm(true); }}>
              + Nova aula
            </button>
          </div>
          {showContentForm && (
            <ContentForm initial={editingContent} onSave={handleSaveContent}
              onCancel={() => { setShowContentForm(false); setEditingContent(null); }} />
          )}
          {(student.contents?.length === 0 && !showContentForm) && (
            <div className="tsp-empty">Nenhuma aula adicionada ainda.</div>
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
                {(c.type === 'video' || c.type === 'pdf') ? (
                  <a href={c.body} target="_blank" rel="noreferrer" className="tsp-content-link">
                    {c.type === 'pdf' ? '📄 Abrir PDF' : c.body}
                  </a>
                ) : (
                  <div className="tsp-content-body">{c.body}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOMEWORK */}
      {tab === 'homework' && (
        <div className="tsp-tab-content">
          <div className="tsp-tab-actions">
            <button className="btn-add" onClick={() => { setEditingQuiz(null); setShowQuizForm(true); }}>
              + Novo homework
            </button>
          </div>
          {showQuizForm && (
            <QuizForm initial={editingQuiz} onSave={handleSaveQuiz}
              onCancel={() => { setShowQuizForm(false); setEditingQuiz(null); }} />
          )}
          {(student.quizzes?.length === 0 && !showQuizForm) && (
            <div className="tsp-empty">Nenhum homework adicionado ainda.</div>
          )}
          <div className="tsp-content-list">
            {(student.quizzes ?? []).map((q) => (
              <div className="tsp-content-card" key={q.id}>
                <div className="tsp-content-top">
                  <span className="content-type-badge">✏️ {q.questions?.length ?? 0} questão(ões)</span>
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

      {/* TEST */}
      {tab === 'test' && (
        <div className="tsp-tab-content">
          <div className="tsp-tab-actions">
            <button className="btn-add" onClick={() => { setEditingTest(null); setShowTestForm(true); }}>
              + Novo test
            </button>
          </div>
          {showTestForm && (
            <TestForm initial={editingTest} onSave={handleSaveTest}
              onCancel={() => { setShowTestForm(false); setEditingTest(null); }} />
          )}
          {(student.tests?.length === 0 && !showTestForm) && (
            <div className="tsp-empty">Nenhum test adicionado ainda.</div>
          )}
          <div className="tsp-content-list">
            {(student.tests ?? []).map((t) => {
              const result = tstResults.find((r) => r.test_id === t.id);
              return (
                <div className="tsp-content-card" key={t.id}>
                  <div className="tsp-content-top">
                    <span className="content-type-badge">📋 {t.questions?.length ?? 0} questão(ões)</span>
                    <div className="tsp-card-actions">
                      {!result && <button onClick={() => { setEditingTest(t); setShowTestForm(true); }}>Editar</button>}
                      <button className="btn-danger" onClick={() => onDeleteTest(t.id)}>Excluir</button>
                    </div>
                  </div>
                  <div className="tsp-content-title">{t.title}</div>
                  {result ? (
                    <div className="tsp-test-result">
                      <span className="tsp-test-grade">{result.grade}/10</span>
                      <span className="tsp-test-score">{result.score}/{result.total} acertos</span>
                      <span className="tsp-test-date">{new Date(result.completed_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ) : (
                    <div className="tsp-test-pending">Aguardando realização</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DESEMPENHO */}
      {tab === 'performance' && (
        <div className="tsp-tab-content">
          {hwResults.length === 0 && tstResults.length === 0 ? (
            <div className="tsp-empty">Nenhuma atividade realizada ainda.</div>
          ) : (
            <>
              {tstResults.length > 0 && (
                <div className="tsp-perf-section">
                  <div className="tsp-perf-section-title">📋 Tests</div>
                  {tstResults.map((r) => {
                    const test = (student.tests ?? []).find((t) => t.id === r.test_id);
                    return (
                      <div className="tsp-perf-row" key={r.id}>
                        <div className="tsp-perf-info">
                          <div className="tsp-perf-name">{test?.title ?? 'Test'}</div>
                          <div className="tsp-perf-date">{new Date(r.completed_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div className="tsp-perf-scores">
                          <span className="tsp-perf-grade">{r.grade}/10</span>
                          <span className="tsp-perf-acertos">{r.score}/{r.total} acertos</span>
                          {test && <button className="tsp-detail-btn" onClick={() => openDetail('test', r.test_id, test.title, test.questions ?? [])}>Ver detalhes</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {hwResults.length > 0 && (
                <div className="tsp-perf-section">
                  <div className="tsp-perf-section-title">✏️ Homeworks</div>
                  {hwResults.map((r) => {
                    const quiz = (student.quizzes ?? []).find((q) => q.id === r.quiz_id);
                    const pct  = Math.round((r.score / r.total) * 100);
                    return (
                      <div className="tsp-perf-row" key={r.id}>
                        <div className="tsp-perf-info">
                          <div className="tsp-perf-name">{quiz?.title ?? 'Homework'}</div>
                          <div className="tsp-perf-date">{new Date(r.completed_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <div className="tsp-perf-scores">
                          <span className="tsp-perf-pct">{pct}%</span>
                          <span className="tsp-perf-acertos">{r.score}/{r.total} acertos</span>
                          {quiz && <button className="tsp-detail-btn" onClick={() => openDetail('quiz', r.quiz_id, quiz.title, quiz.questions ?? [])}>Ver detalhes</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* Detail modal */}
      {detailData && (
        <div className="tsp-detail-overlay" onClick={() => setDetailData(null)}>
          <div className="tsp-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tsp-detail-header">
              <h2>{detailData.title}</h2>
              <button onClick={() => setDetailData(null)}>✕</button>
            </div>
            <div className="tsp-detail-body">
              {detailData.questions.map((q, i) => {
                const ans = detailData.answers.find((a) => a.question_id === q.id);
                const correct = ans?.is_correct;
                return (
                  <div key={q.id} className={`tsp-detail-q ${correct === true ? 'correct' : correct === false ? 'wrong' : 'pending'}`}>
                    <div className="tsp-detail-q-header">
                      <span className="tsp-detail-num">{i + 1}</span>
                      <span className="tsp-detail-icon">{correct === true ? '✓' : correct === false ? '✗' : '—'}</span>
                    </div>
                    <div className="tsp-detail-prompt">{q.prompt}</div>
                    {ans && (
                      <div className="tsp-detail-answer">
                        <span className="tsp-detail-label">Resposta do aluno:</span>
                        <span>{q.type === 'multiple-choice' || q.type === 'true-false'
                          ? q.options?.[ans.answer] ?? ans.answer
                          : ans.answer}</span>
                      </div>
                    )}
                    {!correct && (
                      <div className="tsp-detail-correct">
                        <span className="tsp-detail-label">Resposta correta:</span>
                        <span>{q.type === 'multiple-choice' || q.type === 'true-false'
                          ? q.options?.[q.correct] ?? q.correct
                          : q.correct}</span>
                      </div>
                    )}
                    {!correct && q.explanation && (
                      <div className="tsp-detail-explanation">{q.explanation}</div>
                    )}
                  </div>
                );
              })}
              {detailData.answers.length === 0 && (
                <div className="tsp-empty">Respostas detalhadas não disponíveis para tentativas anteriores.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}