import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTeacherData } from '../../hooks/useTeacherData';
import TeacherSidebar        from '../teacher/TeacherSidebar';
import TeacherHome           from '../teacher/TeacherHome';
import TeacherStudents       from '../teacher/TeacherStudents';
import TeacherStudentProfile from '../teacher/TeacherStudentProfile';
import '../../styles/TeacherDashboard.css';
import { SkeletonTeacherHome } from '../ui/Skeleton';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { students, loading, saveContent, deleteContent, saveQuiz, deleteQuiz, updateLevel } = useTeacherData();

  const [section, setSection]               = useState('home');
  const [selectedStudent, setSelectedStudent] = useState(null);

  function openStudent(student) {
    setSelectedStudent(student);
    setSection('student-profile');
  }

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  // Keep selectedStudent in sync with latest data
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
            onUpdateLevel={(l)  => updateLevel(currentStudent.id, l)}
          />
        );
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
      />
      <main className="td-main">
        {renderSection()}
      </main>
    </div>
  );
}