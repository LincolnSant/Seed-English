import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage      from './components/pages/LandingPage';
import LoginPage        from './components/pages/LoginPage';
import RegisterPage     from './components/pages/RegisterPage';
import TeacherDashboard from './components/pages/TeacherDashboard';
import StudentDashboard from './components/pages/StudentDashboard';
import './styles/App.css';

function AppLoading() {
  return (
    <div className="app-loading">
      <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="app-loading-logo-img" />
      <div className="app-loading-spinner" />
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth();
  if (loading)  return <AppLoading />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!profile) return <AppLoading />;
  if (profile.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return <AppLoading />;

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