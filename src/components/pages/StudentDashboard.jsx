import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../hooks/useStudentData';
import StudentHome    from '../student/StudentHome';
import StudentContent from '../student/StudentContent';
import StudentQuiz    from '../student/StudentQuiz';
import StudentTest    from '../student/StudentTest';
import { SkeletonStudentHome } from '../ui/Skeleton';
import '../../styles/StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const {
    contents, quizzes, tests,
    homeworkResults, testResults,
    loading, saveHomeworkResult, saveTestResult,
    hasCompletedTest, getTestResult,
  } = useStudentData(profile?.id);

  const [section,  setSection]  = useState('home');
  const [selected, setSelected] = useState(null);

  function openContent(content) { setSelected(content); setSection('content'); }
  function openQuiz(quiz)       { setSelected(quiz);    setSection('quiz'); }
  function openTest(test)       { setSelected(test);    setSection('test'); }
  function goHome()             { setSelected(null);    setSection('home'); }

  async function handleLogout() { await signOut(); navigate('/login'); }

  if (loading) return <SkeletonStudentHome />;

  const student = {
    ...profile,
    initials: profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    contents, quizzes, tests, homeworkResults, testResults,
  };

  return (
    <div className="sd-root">
      {section === 'home' && (
        <StudentHome
          student={student}
          onOpenContent={openContent}
          onOpenQuiz={openQuiz}
          onOpenTest={openTest}
          onLogout={handleLogout}
          hasCompletedTest={hasCompletedTest}
          getTestResult={getTestResult}
        />
      )}
      {section === 'content' && <StudentContent content={selected} onBack={goHome} />}
      {section === 'quiz' && (
        <StudentQuiz quiz={selected} onBack={goHome} onComplete={saveHomeworkResult} />
      )}
      {section === 'test' && (
        <StudentTest
          test={selected}
          onBack={goHome}
          onComplete={saveTestResult}
          existingResult={getTestResult(selected?.id)}
        />
      )}
    </div>
  );
}