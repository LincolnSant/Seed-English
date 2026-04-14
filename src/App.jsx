import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage      from './components/pages/LandingPage';
import LoginPage        from './components/pages/LoginPage';
import RegisterPage     from './components/pages/RegisterPage';
import TeacherDashboard from './components/pages/TeacherDashboard';
import StudentDashboard from './components/pages/StudentDashboard';
import './styles/App.css';

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth();
  if (loading)   return <div className="app-loading">Carregando...</div>;
  if (!user)     return <Navigate to="/login" replace />;
  if (!profile)  return <div className="app-loading">Carregando perfil...</div>;
  if (profile.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/cadastro"  element={<RegisterPage />} />
        <Route path="/aluno"     element={
          <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/professor" element={
          <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}