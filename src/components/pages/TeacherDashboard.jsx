import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTeacherData } from '../../hooks/useTeacherData';
import TeacherSidebar        from '../teacher/TeacherSidebar';
import TeacherHome           from '../teacher/TeacherHome';
import TeacherFeed           from '../teacher/TeacherFeed';
import TeacherStudents       from '../teacher/TeacherStudents';
import TeacherStudentProfile from '../teacher/TeacherStudentProfile';
import { SkeletonTeacherHome } from '../ui/Skeleton';
import '../../styles/TeacherDashboard.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const {
    students, loading,
    saveContent, deleteContent,
    saveQuiz, deleteQuiz,
    saveTest, deleteTest,
    updateLevel,
  } = useTeacherData();

  const [section, setSection]                 = useState('home');
  const [avatarColor, setAvatarColor]           = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  function openStudent(student) { setSelectedStudent(student); setSection('student-profile'); }
  async function handleLogout() { await signOut(); navigate('/login'); }

  const currentStudent = selectedStudent
    ? students.find((s) => s.id === selectedStudent.id) ?? selectedStudent
    : null;

  if (loading) return (
    <div className="td-root">
      <div style={{ width: 230, minWidth: 230, background: '#1A1612' }} />
      <main className="td-main"><SkeletonTeacherHome /></main>
    </div>
  );

  function renderSection() {
    switch (section) {
      case 'students':
        return <TeacherStudents students={students} onOpenStudent={openStudent} />;
      case 'student-profile':
        return (
          <TeacherStudentProfile
            student={currentStudent}
            onBack={() => setSection('students')}
            onSaveContent={(c)  => saveContent(currentStudent.id, c)}
            onDeleteContent={(id) => deleteContent(currentStudent.id, id)}
            onSaveQuiz={(q)     => saveQuiz(currentStudent.id, q)}
            onDeleteQuiz={(id)  => deleteQuiz(currentStudent.id, id)}
            onSaveTest={(t)     => saveTest(currentStudent.id, t)}
            onDeleteTest={(id)  => deleteTest(currentStudent.id, id)}
            onUpdateLevel={(l)  => updateLevel(currentStudent.id, l)}
          />
        );
      case 'feed':
        return <TeacherFeed teacherId={profile?.id} teacherName={profile?.name} />;
      default:
        return <TeacherHome students={students} onGoStudents={() => setSection('students')} onOpenStudent={openStudent} />;
    }
  }

  return (
    <div className="td-root">
      <TeacherSidebar
        active={section}
        onChange={setSection}
        onLogout={handleLogout}
        profile={profile ? { ...profile, avatar_color: avatarColor ?? profile.avatar_color } : null}
        onColorChange={setAvatarColor}
      />
      <main className="td-main">{renderSection()}</main>
    </div>
  );
}