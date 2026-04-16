import { useState } from 'react';
import '../../styles/TeacherHome.css';

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];

const LEVEL_LABELS = {
  'A1': 'A1 · Beginner',
  'A2': 'A2 · Elementary',
  'B1': 'B1 · Intermediate',
  'B2': 'B2 · Upper Intermediate',
  'C1': 'C1 · Advanced',
};

export default function TeacherStudents({ students, onOpenStudent }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) => {
    const matchLevel  = filter === 'All' || s.level === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  return (
    <div className="tstudents-root">
      <div className="tstudents-header">
        <div>
          <h1>Students</h1>
          <p>{students.length} student{students.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      <div className="tstudents-filters">
        <input
          className="tstudents-search"
          type="text"
          placeholder="Search student..."
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
          <div className="tstudents-empty">No students found.</div>
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
                  {LEVEL_LABELS[s.level] ?? s.level ?? 'No level'}
                </span>
              </div>
              <div className="tstudents-row-right">
                <span>{s.contents?.length ?? 0} classes</span>
                <span>{s.quizzes?.length ?? 0} homework</span>
                <span className="tstudents-arrow">→</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}