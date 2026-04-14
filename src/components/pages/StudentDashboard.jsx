import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../hooks/useStudentData';
import StudentHome    from '../student/StudentHome';
import StudentContent from '../student/StudentContent';
import StudentQuiz    from '../student/StudentQuiz';
import '../../styles/StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { contents, quizzes, loading } = useStudentData(profile?.id);

  const [section,  setSection]  = useState('home');
  const [selected, setSelected] = useState(null);

  function openContent(content) { setSelected(content); setSection('content'); }
  function openQuiz(quiz)       { setSelected(quiz);    setSection('quiz'); }
  function goHome()             { setSelected(null);    setSection('home'); }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  if (loading) return <div className="app-loading">Carregando...</div>;

  const student = {
    ...profile,
    initials: profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    contents,
    quizzes,
  };

  return (
    <div className="sd-root">
      {section === 'home'    && <StudentHome    student={student} onOpenContent={openContent} onOpenQuiz={openQuiz} onLogout={handleLogout} />}
      {section === 'content' && <StudentContent content={selected} onBack={goHome} />}
      {section === 'quiz'    && <StudentQuiz    quiz={selected}    onBack={goHome} />}
    </div>
  );
}