import { useState } from 'react';
import '../../styles/TeacherHome.css';

const LEVELS = ['Todos', 'Básico', 'Intermediário', 'Avançado'];

export default function TeacherStudents({ students, onOpenStudent }) {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) => {
    const matchLevel  = filter === 'Todos' || s.level === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <div className="tstudents-root">
      <div className="tstudents-header">
        <div>
          <h1>Alunos</h1>
          <p>{students.length} alunos cadastrados</p>
        </div>
      </div>

      <div className="tstudents-filters">
        <input
          className="tstudents-search"
          type="text"
          placeholder="Buscar aluno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="tstudents-level-filters">
          {LEVELS.map((l) => (
            <button
              key={l}
              className={`level-filter-btn ${filter === l ? 'active' : ''}`}
              onClick={() => setFilter(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="tstudents-list">
        {filtered.length === 0 ? (
          <div className="tstudents-empty">Nenhum aluno encontrado.</div>
        ) : (
          filtered.map((s) => (
            <div className="tstudents-row" key={s.id} onClick={() => onOpenStudent(s)}>
              <div className="tstudents-row-left">
                <div className="tstudents-avatar">{s.initials}</div>
                <div>
                  <div className="tstudents-name">{s.name}</div>
                  <div className="tstudents-email">{s.email}</div>
                </div>
              </div>
              <div className="tstudents-row-center">
                <span className={`level-badge level-${(s.level ?? '').toLowerCase()}`}>
                  {s.level ?? 'Sem nível'}
                </span>
              </div>
              <div className="tstudents-row-right">
                <span>{s.contents?.length ?? 0} conteúdos</span>
                <span>{s.quizzes?.length ?? 0} quiz</span>
                <span className="tstudents-arrow">→</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}