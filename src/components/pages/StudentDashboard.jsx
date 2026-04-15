import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../hooks/useStudentData';
import StudentFeed    from '../student/StudentFeed';
import StudentHome    from '../student/StudentHome';
import StudentContent from '../student/StudentContent';
import StudentQuiz    from '../student/StudentQuiz';
import StudentTest    from '../student/StudentTest';
import { SkeletonStudentHome } from '../ui/Skeleton';
import AvatarPicker from '../shared/AvatarPicker';
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

  const [mainTab,     setMainTab]     = useState('feed');
  const [avatarColor, setAvatarColor] = useState(null);
  const [avatarPhoto, setAvatarPhoto] = useState(null); // 'feed' | 'study'
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
    avatar_color: avatarColor ?? profile?.avatar_color,
    avatar_url:   avatarPhoto ?? profile?.avatar_url,
    contents, quizzes, tests, homeworkResults, testResults,
  };

  // Inside content/quiz/test — no tab bar
  if (section === 'content') return <StudentContent content={selected} onBack={goHome} />;
  if (section === 'quiz')    return <StudentQuiz quiz={selected} onBack={goHome} onComplete={saveHomeworkResult} />;
  if (section === 'test')    return <StudentTest test={selected} onBack={goHome} onComplete={saveTestResult} existingResult={getTestResult(selected?.id)} />;

  return (
    <div className="sd-root">
      {/* Top nav with two main tabs */}
      <header className="sh-topbar">
        <div className="sh-logo">Seed <span>English</span></div>
        <div className="sd-main-tabs">
          <button className={`sd-main-tab ${mainTab === 'feed' ? 'active' : ''}`} onClick={() => setMainTab('feed')}>
            Feed
          </button>
          <button className={`sd-main-tab ${mainTab === 'study' ? 'active' : ''}`} onClick={() => setMainTab('study')}>
            Seeds
          </button>
        </div>
        <div className="sh-topbar-right">
          <div className="sh-user">
            <AvatarPicker
              profile={student}
              onColorChange={setAvatarColor}
              onPhotoChange={setAvatarPhoto}
              size={32}
              dark={false}
            />
            <span>{student.name}</span>
          </div>
          <button className="sh-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {mainTab === 'feed' ? (
        <StudentFeed student={student} onLogout={handleLogout} hideTopbar />
      ) : (
        <StudentHome
          student={student}
          onOpenContent={openContent}
          onOpenQuiz={openQuiz}
          onOpenTest={openTest}
          onLogout={handleLogout}
          hasCompletedTest={hasCompletedTest}
          getTestResult={getTestResult}
          onColorChange={setAvatarColor}
          onPhotoChange={setAvatarPhoto}
          hideTopbar
        />
      )}
    </div>
  );
}