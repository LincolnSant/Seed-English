import { useState } from 'react';
import '../../styles/StudentQuiz.css';

export default function StudentTest({ test, onBack, onComplete, existingResult }) {
  const [current,    setCurrent]    = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [results,    setResults]    = useState([]);
  const [answers,    setAnswers]    = useState([]);
  const [finished,   setFinished]   = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [saved,      setSaved]      = useState(false);

  const total    = test.questions.length;
  const question = test.questions[current];

  // ── Already completed ─────────────────────────────────
  if (existingResult) {
    const pct = Math.round((existingResult.score / existingResult.total) * 100);
    return (
      <div className="sq-root">
        <div className="sq-inner">
          <button className="sq-back" onClick={onBack}>← Back</button>
          <div className="sq-finished">
            <div className="sq-finished-icon">📋</div>
            <h1>Test already completed</h1>
            <p>{test.title}</p>
            <div className="sq-score">
              <span className="sq-score-num">{existingResult.grade}</span>
              <span className="sq-score-total">/10</span>
            </div>
            <div className="sq-score-bar-wrap">
              <div className="sq-score-bar" style={{ width: `${pct}%` }} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
              {existingResult.score}/{existingResult.total} correct
            </p>
            <div className="sq-finished-actions">
              <button className="sq-btn-primary" onClick={onBack}>← Back to home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function isCorrect(q, answer) {
    if (q.type === 'fill-blank') return answer?.trim().toLowerCase() === q.correct?.toString().toLowerCase();
    return answer === q.correct;
  }

  function handleSubmit() {
    if (selected === null || selected === '') return;
    setSubmitted(true);
  }

  async function handleNext() {
    const currentCorrect = isCorrect(question, selected);
    const allResults     = [...results, currentCorrect];
    const newAnswer      = { question_id: question.id, answer: selected, is_correct: currentCorrect };
    const allAnswers     = [...answers, newAnswer];

    if (current + 1 >= total) {
      const score = allResults.filter(Boolean).length;
      setFinalScore(score);
      setFinished(true);
      if (!saved) {
        setSaved(true);
        await onComplete(test.id, score, allResults.length, allAnswers);
      }
    } else {
      setResults(allResults);
      setAnswers(allAnswers);
      setCurrent((p) => p + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  // ── Finished screen ───────────────────────────────────
  if (finished) {
    const grade = parseFloat(((finalScore / total) * 10).toFixed(1));
    const pct   = Math.round((finalScore / total) * 100);
    return (
      <div className="sq-root">
        <div className="sq-inner">
          <button className="sq-back" onClick={onBack}>← Back</button>
          <div className="sq-finished">
            <div className="sq-finished-icon">{grade >= 6 ? '🎉' : '📖'}</div>
            <h1>{grade >= 6 ? 'Passed!' : 'Keep studying!'}</h1>
            <p>{test.title}</p>
            <div className="sq-score">
              <span className="sq-score-num">{grade}</span>
              <span className="sq-score-total">/10</span>
            </div>
            <div className="sq-score-bar-wrap">
              <div className="sq-score-bar" style={{ width: `${pct}%` }} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
              {finalScore}/{total} correct
            </p>
            <div className="sq-finished-actions">
              <button className="sq-btn-primary" onClick={onBack}>← Back to home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────
  return (
    <div className="sq-root">
      <div className="sq-inner">
        <button className="sq-back" onClick={onBack}>← Back to home</button>

        <div className="sq-header">
          <div className="sq-quiz-title">{test.title}</div>
          <div className="sq-progress-row">
            <div className="sq-progress-bar-wrap">
              <div className="sq-progress-fill" style={{ width: `${(current / total) * 100}%` }} />
            </div>
            <span className="sq-progress-label">{current + 1} / {total}</span>
          </div>
        </div>

        <div className="sq-card">
          <div className="sq-question-num">Question {current + 1}</div>
          <div className="sq-question-prompt">{question.prompt}</div>

          {question.type === 'multiple-choice' && (
            <div className="sq-options">
              {question.options.map((opt, i) => {
                let cls = 'sq-option';
                if (submitted) {
                  if (i === question.correct) cls += ' correct';
                  else if (i === selected)    cls += ' wrong';
                } else if (i === selected) cls += ' selected';
                return (
                  <button key={i} className={cls} onClick={() => !submitted && setSelected(i)} disabled={submitted}>
                    <span className="sq-option-letter">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'true-false' && (
            <div className="sq-tf-options">
              {question.options.map((opt, i) => {
                let cls = 'sq-tf-btn';
                if (submitted) {
                  if (i === question.correct) cls += ' correct';
                  else if (i === selected)    cls += ' wrong';
                } else if (i === selected) cls += ' selected';
                return (
                  <button key={i} className={cls} onClick={() => !submitted && setSelected(i)} disabled={submitted}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'fill-blank' && (
            <div className="sq-fill">
              <input type="text"
                className={`sq-fill-input ${submitted ? (isCorrect(question, selected) ? 'correct' : 'wrong') : ''}`}
                placeholder="Digite sua resposta..."
                value={selected ?? ''}
                onChange={(e) => !submitted && setSelected(e.target.value)}
                disabled={submitted}
              />
            </div>
          )}

          {submitted && (
            <div className={`sq-feedback ${isCorrect(question, selected) ? 'correct' : 'wrong'}`}>
              <div className="sq-feedback-icon">
                {isCorrect(question, selected) ? '✓ Correto!' : '✗ Incorreto'}
              </div>
              {!isCorrect(question, selected) && question.explanation && (
                <div className="sq-feedback-explanation">{question.explanation}</div>
              )}
            </div>
          )}
        </div>

        <div className="sq-actions">
          {!submitted ? (
            <button className="sq-btn-primary" onClick={handleSubmit}
              disabled={selected === null || selected === ''}>
              Confirm resposta
            </button>
          ) : (
            <button className="sq-btn-primary" onClick={handleNext}>
              {current + 1 >= total ? 'See result →' : 'Next question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}