import { useState } from 'react';
import '../../styles/Forms.css';

const EMPTY_QUESTION = {
  type: 'multiple-choice',
  prompt: '',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
};

function emptyQuestion() { return JSON.parse(JSON.stringify(EMPTY_QUESTION)); }

export default function TestForm({ initial, onSave, onCancel }) {
  const [title,     setTitle]     = useState(initial?.title ?? '');
  const [questions, setQuestions] = useState(initial?.questions ?? [emptyQuestion()]);

  function updateQuestion(index, field, value) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  }

  function updateOption(qIndex, oIndex, value) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = [...q.options];
      options[oIndex] = value;
      return { ...q, options };
    }));
  }

  function addQuestion() { setQuestions((prev) => [...prev, emptyQuestion()]); }
  function removeQuestion(index) { setQuestions((prev) => prev.filter((_, i) => i !== index)); }

  function changeType(index, type) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== index) return q;
      if (type === 'true-false') return { ...q, type, options: ['Verdadeiro', 'Falso'], correct: 0 };
      if (type === 'fill-blank') return { ...q, type, options: [], correct: '' };
      return { ...q, type, options: ['', '', '', ''], correct: 0 };
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ id: initial?.id, title: title.trim(), questions });
  }

  return (
    <form className="ef-form" onSubmit={handleSubmit}>
      <div className="ef-form-title">{initial ? 'Editar test' : 'Novo test'}</div>
      <div className="ef-hint-banner">
        📋 O aluno terá apenas uma tentativa para completar este test.
      </div>

      <div className="ef-field">
        <label htmlFor="tf-title">Título do test</label>
        <input
          id="tf-title" type="text"
          placeholder="Ex: Test — Unit 1"
          value={title} onChange={(e) => setTitle(e.target.value)} required
        />
      </div>

      {questions.map((q, qi) => (
        <div className="ef-question-block" key={qi}>
          <div className="ef-question-header">
            <span className="ef-question-num">Questão {qi + 1}</span>
            <div className="ef-question-type-row">
              {['multiple-choice', 'true-false', 'fill-blank'].map((t) => (
                <button type="button" key={t}
                  className={`ef-type-btn small ${q.type === t ? 'active' : ''}`}
                  onClick={() => changeType(qi, t)}
                >
                  {t === 'multiple-choice' && 'Múltipla escolha'}
                  {t === 'true-false'      && 'Verdadeiro/Falso'}
                  {t === 'fill-blank'      && 'Preencha a lacuna'}
                </button>
              ))}
            </div>
            {questions.length > 1 && (
              <button type="button" className="ef-remove-q" onClick={() => removeQuestion(qi)}>✕</button>
            )}
          </div>

          <div className="ef-field">
            <label>Enunciado</label>
            <input type="text"
              placeholder={q.type === 'fill-blank' ? 'Ex: She ___ to London twice.' : 'Ex: Which tense is used here?'}
              value={q.prompt} onChange={(e) => updateQuestion(qi, 'prompt', e.target.value)} required
            />
          </div>

          {q.type === 'multiple-choice' && (
            <div className="ef-field">
              <label>Alternativas — clique no ✓ para marcar a correta</label>
              <div className="ef-options">
                {q.options.map((opt, oi) => (
                  <div className="ef-option-row" key={oi}>
                    <button type="button"
                      className={`ef-correct-btn ${q.correct === oi ? 'active' : ''}`}
                      onClick={() => updateQuestion(qi, 'correct', oi)}
                    >
                      {q.correct === oi ? '✓' : '○'}
                    </button>
                    <input type="text" placeholder={`Alternativa ${oi + 1}`}
                      value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {q.type === 'true-false' && (
            <div className="ef-field">
              <label>Resposta correta</label>
              <div className="ef-tf-row">
                {['Verdadeiro', 'Falso'].map((opt, oi) => (
                  <button type="button" key={opt}
                    className={`ef-tf-btn ${q.correct === oi ? 'active' : ''}`}
                    onClick={() => updateQuestion(qi, 'correct', oi)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.type === 'fill-blank' && (
            <div className="ef-field">
              <label>Resposta correta</label>
              <input type="text" placeholder="Ex: has been"
                value={q.correct} onChange={(e) => updateQuestion(qi, 'correct', e.target.value)} required
              />
            </div>
          )}

          <div className="ef-field">
            <label>Explicação (mostrada ao errar)</label>
            <textarea placeholder="Explique a resposta correta..."
              value={q.explanation} onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)} rows={3}
            />
          </div>
        </div>
      ))}

      <button type="button" className="ef-add-question" onClick={addQuestion}>
        + Adicionar questão
      </button>

      <div className="ef-form-actions">
        <button type="button" className="ef-btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="ef-btn-save">
          {initial ? 'Salvar alterações' : 'Criar test'}
        </button>
      </div>
    </form>
  );
}