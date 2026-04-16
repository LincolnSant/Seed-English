import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Faz login
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError('Email ou senha incorretos.');
      setLoading(false);
      return;
    }

    // 2. Busca o perfil diretamente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      setError('Perfil não encontrado. Contate o administrador.');
      setLoading(false);
      return;
    }

    // 3. Redireciona
    navigate(profile.role === 'teacher' ? '/professor' : '/aluno', { replace: true });
  }

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-left-inner">
          <button className="login-back" onClick={() => navigate('/')}>← Back</button>
          <div className="login-brand">
            <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="login-logo-img" />
            <p className="login-brand-desc">
              Sua jornada no inglês começa aqui. Acesse sua conta e continue de onde parou.
            </p>
          </div>
          <div className="login-testimonial">
            <div className="testimonial-quote">
              Em 3 meses com a plataforma, minha confiança no inglês mudou completamente.
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">CM</div>
              <div>
                <div className="testimonial-name">Carlos Mendes</div>
                <div className="testimonial-role">Student · A2 Elementary</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Bem vindo de volta!</h2>
            <p>Entre com seu e-mail e senha para continuar</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <div className="form-group-row">
                <label htmlFor="password">Senha</label>
                <a href="#" className="form-forgot">Esqueceu a senha?</a>
              </div>
              <input
                id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
              />
            </div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button type="submit" className="btn-login" disabled={loading || !email || !password}>
              {loading ? <span className="btn-spinner" /> : 'Sign in na conta →'}
            </button>
          </form>
          <div className="login-footer-note">
            Não tem conta?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/cadastro'); }}>
              Criar conta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}