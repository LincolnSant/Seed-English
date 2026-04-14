import { useState } from 'react';
import '../../styles/StudentQuiz.css';

export default function StudentQuiz({ quiz, onBack }) {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);   // index or string
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults]   = useState([]);      // true/false per question
  const [finished, setFinished] = useState(false);

  const question = quiz.questions[current];
  const total    = quiz.questions.length;

  // ── Check answer ─────────────────────────────────────
  function isCorrect(q, answer) {
    if (q.type === 'fill-blank') {
      return answer?.trim().toLowerCase() === q.correct?.toString().toLowerCase();
    }
    return answer === q.correct;
  }

  function handleSubmit() {
    if (selected === null || selected === '') return;
    const correct = isCorrect(question, selected);
    setResults((prev) => [...prev, correct]);
    setSubmitted(true);
  }

  function handleNext() {
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent((p) => p + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  // ── Finished screen ───────────────────────────────────
  if (finished) {
    const score = results.filter(Boolean).length;
    const pct   = Math.round((score / total) * 100);
    return (
      <div className="sq-root">
        <div className="sq-inner">
          <button className="sq-back" onClick={onBack}>← Voltar</button>
          <div className="sq-finished">
            <div className="sq-finished-icon">{pct >= 70 ? '🎉' : '📖'}</div>
            <h1>{pct >= 70 ? 'Muito bem!' : 'Continue praticando!'}</h1>
            <p>{quiz.title}</p>
            <div className="sq-score">
              <span className="sq-score-num">{score}</span>
              <span className="sq-score-total">/{total} corretas</span>
            </div>
            <div className="sq-score-bar-wrap">
              <div className="sq-score-bar" style={{ width: `${pct}%` }} />
            </div>
            <div className="sq-finished-actions">
              <button className="sq-btn-primary" onClick={onBack}>
                ← Voltar ao início
              </button>
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

        <button className="sq-back" onClick={onBack}>← Voltar ao início</button>

        {/* Header */}
        <div className="sq-header">
          <div className="sq-quiz-title">{quiz.title}</div>
          <div className="sq-progress-row">
            <div className="sq-progress-bar-wrap">
              <div
                className="sq-progress-fill"
                style={{ width: `${((current) / total) * 100}%` }}
              />
            </div>
            <span className="sq-progress-label">{current + 1} / {total}</span>
          </div>
        </div>

        {/* Question */}
        <div className="sq-card">
          <div className="sq-question-num">Pergunta {current + 1}</div>
          <div className="sq-question-prompt">{question.prompt}</div>

          {/* Multiple choice */}
          {question.type === 'multiple-choice' && (
            <div className="sq-options">
              {question.options.map((opt, i) => {
                let cls = 'sq-option';
                if (submitted) {
                  if (i === question.correct) cls += ' correct';
                  else if (i === selected)    cls += ' wrong';
                } else if (i === selected) {
                  cls += ' selected';
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => !submitted && setSelected(i)}
                    disabled={submitted}
                  >
                    <span className="sq-option-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* True / False */}
          {question.type === 'true-false' && (
            <div className="sq-tf-options">
              {question.options.map((opt, i) => {
                let cls = 'sq-tf-btn';
                if (submitted) {
                  if (i === question.correct) cls += ' correct';
                  else if (i === selected)    cls += ' wrong';
                } else if (i === selected) {
                  cls += ' selected';
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => !submitted && setSelected(i)}
                    disabled={submitted}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill in the blank */}
          {question.type === 'fill-blank' && (
            <div className="sq-fill">
              <input
                type="text"
                className={`sq-fill-input ${submitted ? (isCorrect(question, selected) ? 'correct' : 'wrong') : ''}`}
                placeholder="Digite sua resposta..."
                value={selected ?? ''}
                onChange={(e) => !submitted && setSelected(e.target.value)}
                disabled={submitted}
              />
            </div>
          )}

          {/* Feedback after submit */}
          {submitted && (
            <div className={`sq-feedback ${isCorrect(question, selected) ? 'correct' : 'wrong'}`}>
              <div className="sq-feedback-icon">
                {isCorrect(question, selected) ? '✓ Correto!' : '✗ Incorreto'}
              </div>
              {question.explanation && (
                <div className="sq-feedback-explanation">{question.explanation}</div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sq-actions">
          {!submitted ? (
            <button
              className="sq-btn-primary"
              onClick={handleSubmit}
              disabled={selected === null || selected === ''}
            >
              Confirmar resposta
            </button>
          ) : (
            <button className="sq-btn-primary" onClick={handleNext}>
              {current + 1 >= total ? 'Ver resultado →' : 'Próxima pergunta →'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}