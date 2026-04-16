import { useState } from 'react';
import '../../styles/StudentQuiz.css';

export default function StudentQuiz({ quiz, onBack, onComplete }) {
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results,   setResults]   = useState([]);
  const [finished,  setFinished]  = useState(false);
  const [saved,     setSaved]     = useState(false);

  const question = quiz.questions[current];
  const total    = quiz.questions.length;

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
      setFinished(true);
      if (!saved) {
        setSaved(true);
        await onComplete?.(quiz.id, score, allResults.length, allAnswers);
      }
    } else {
      setResults(allResults);
      setAnswers(allAnswers);
      setCurrent((p) => p + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  if (finished) {
    const score = results.filter(Boolean).length;
    const pct   = Math.round((score / total) * 100);
    return (
      <div className="sq-root">
        <div className="sq-inner">
          <button className="sq-back" onClick={onBack}>← Back</button>
          <div className="sq-finished">
            <div className="sq-finished-icon">{pct >= 70 ? '🎉' : '📖'}</div>
            <h1>{pct >= 70 ? 'Well done!' : 'Keep practicing!'}</h1>
            <p>{quiz.title}</p>
            <div className="sq-score">
              <span className="sq-score-num">{score}</span>
              <span className="sq-score-total">/{total} correct</span>
            </div>
            <div className="sq-score-bar-wrap">
              <div className="sq-score-bar" style={{ width: `${pct}%` }} />
            </div>
            <div className="sq-finished-actions">
              <button className="sq-btn-primary" onClick={onBack}>← Back to home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sq-root">
      <div className="sq-inner">
        <button className="sq-back" onClick={onBack}>← Back to home</button>
        <div className="sq-header">
          <div className="sq-quiz-title">{quiz.title}</div>
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