import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'student' } },
    });

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
      return;
    }

    // Atualiza o perfil com o nome (trigger já criou com role=student)
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ name, role: 'student' })
        .eq('id', data.user.id);
    }

    navigate('/aluno', { replace: true });
  }

  return (
    <div className="rp-root">
      <div className="rp-left">
        <div className="rp-left-inner">
          <button className="rp-back" onClick={() => navigate('/')}>← Voltar</button>
          <div className="rp-brand">
            <div className="rp-logo">english<span>flow</span></div>
            <p className="rp-brand-desc">
              Crie sua conta e comece sua jornada no inglês com conteúdos feitos especialmente pra você.
            </p>
          </div>
          <div className="rp-features">
            <div className="rp-feature">
              <span className="rp-feature-icon">📚</span>
              <span>Conteúdos personalizados pela sua professora</span>
            </div>
            <div className="rp-feature">
              <span className="rp-feature-icon">✏️</span>
              <span>Quiz interativos com feedback imediato</span>
            </div>
            <div className="rp-feature">
              <span className="rp-feature-icon">📈</span>
              <span>Acompanhe sua evolução a cada aula</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rp-right">
        <div className="rp-form-wrap">
          <div className="rp-form-header">
            <h2>Criar minha conta</h2>
            <p>Preencha os dados abaixo para começar</p>
          </div>

          <form className="rp-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name" type="text" placeholder="Seu nome"
                value={name} onChange={(e) => setName(e.target.value)}
                required autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email" type="email" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password" type="password" placeholder="Mínimo 6 caracteres"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirmar senha</label>
              <input
                id="confirm" type="password" placeholder="Repita a senha"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                required autoComplete="new-password"
              />
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button
              type="submit"
              className="btn-login"
              disabled={loading || !name || !email || !password || !confirm}
            >
              {loading ? <span className="btn-spinner" /> : 'Criar conta →'}
            </button>
          </form>

          <div className="rp-footer-note">
            Já tem conta?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Entrar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}