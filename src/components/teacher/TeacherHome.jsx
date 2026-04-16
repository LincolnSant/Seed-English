import '../../styles/TeacherHome.css';

export default function TeacherHome({ students, onGoStudents, onOpenStudent }) {
  const totalContents = students.reduce((acc, s) => acc + (s.contents?.length ?? 0), 0);
  const totalQuizzes  = students.reduce((acc, s) => acc + (s.quizzes?.length  ?? 0), 0);

  return (
    <div className="th-root">
      <div className="th-header">
        <div>
          <h1>Overview</h1>
          <p>Welcome back! Aqui está um resumo da sua turma.</p>
        </div>
      </div>

      <div className="th-stats">
        <div className="th-stat-card">
          <div className="th-stat-icon">👤</div>
          <div className="th-stat-num">{students.length}</div>
          <div className="th-stat-label">Students ativos</div>
        </div>
        <div className="th-stat-card">
          <div className="th-stat-icon">📚</div>
          <div className="th-stat-num">{totalContents}</div>
          <div className="th-stat-label">Content criados</div>
        </div>
        <div className="th-stat-card">
          <div className="th-stat-icon">✏️</div>
          <div className="th-stat-num">{totalQuizzes}</div>
          <div className="th-stat-label">Quizzes created</div>
        </div>
      </div>

      <div className="th-section">
        <div className="th-section-header">
          <h2>Students recentes</h2>
          <button className="th-see-all" onClick={onGoStudents}>See all →</button>
        </div>
        <div className="th-students-grid">
          {students.slice(0, 4).map((s) => (
            <div className="th-student-card" key={s.id} onClick={() => onOpenStudent(s)}>
              <div className="th-student-avatar">{s.initials}</div>
              <div className="th-student-info">
                <div className="th-student-name">{s.name}</div>
                <div className="th-student-level">{s.level ?? 'No level'}</div>
              </div>
              <div className="th-student-meta">
                <span>{s.contents?.length ?? 0} conteúdos</span>
                <span>{s.quizzes?.length ?? 0} quiz</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}