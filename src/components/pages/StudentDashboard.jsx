import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useStudentData } from '../../hooks/useStudentData';
import StudentFeed    from '../student/StudentFeed';
import StudentHome    from '../student/StudentHome';
import StudentContent from '../student/StudentContent';
import StudentQuiz    from '../student/StudentQuiz';
import StudentTest    from '../student/StudentTest';
import { SkeletonStudentHome } from '../ui/Skeleton';
import AvatarPicker from '../shared/AvatarPicker';
import NotificationBell from '../shared/NotificationBell';
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
  const [feedUnread,  setFeedUnread]  = useState(0);
  const [seedUnread,  setSeedUnread]  = useState(0);
  const [feedUnread,  setFeedUnread]  = useState(0);
  const [seedUnread,  setSeedUnread]  = useState(0);
  const [avatarColor, setAvatarColor] = useState(null);
  const [avatarPhoto, setAvatarPhoto] = useState(null); // 'feed' | 'study'
  const [section,  setSection]  = useState('home');
  const [selected, setSelected] = useState(null);

  // Update tab badges from notifications
  const { notifications } = useNotifications ? {} : {};

  // Track new items per tab
  const [tabBadges, setTabBadges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`ef_badges_${profile?.id}`) || '{"feed":0,"study":0}');
    } catch { return { feed: 0, study: 0 }; }
  });

  // Listen for new notifications to update badges
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase.channel(`badges:${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload) => {
        const type = payload.new?.type;
        const tab = type === 'new_post' ? 'feed' : 'study';
        setTabBadges((prev) => {
          const next = { ...prev, [tab]: (prev[tab] || 0) + 1 };
          localStorage.setItem(`ef_badges_${profile.id}`, JSON.stringify(next));
          return next;
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile?.id]);

  // Clear badge when switching tabs
  function handleTabChange(tab) {
    setMainTab(tab);
    setTabBadges((prev) => ({ ...prev, [tab]: 0 }));
    localStorage.setItem(`ef_tab_${profile?.id}_${tab}`, Date.now().toString());
  }

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
        <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="sd-topbar-logo" />
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
          <NotificationBell userId={profile?.id} userRole="student" dark={false} onNavigate={(dest) => { if (dest.tab) setMainTab(dest.tab); }} />
          <button className="sh-logout" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <div className="sd-tab-bar">
        <button className={`sd-main-tab ${mainTab === 'feed' ? 'active' : ''}`} onClick={() => setMainTab('feed')}>
          Feed
        </button>
        <button className={`sd-main-tab ${mainTab === 'study' ? 'active' : ''}`} onClick={() => setMainTab('study')}>
          Seeds
        </button>
      </div>

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