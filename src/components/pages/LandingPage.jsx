import { useNavigate } from 'react-router-dom';
import '../../styles/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp-root">
      <nav className="lp-nav">
        <div className="lp-logo">english<span>flow</span></div>
        <div className="lp-nav-links">
          <a href="#">Como funciona</a>
          <a href="#">Conteúdos</a>
          <a href="#">Planos</a>
          <button className="btn-nav" onClick={() => navigate('/login')}>Entrar</button>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="lp-hero-left">
          <div className="lp-tag">Plataforma de inglês</div>
          <h1>Aprenda inglês <em>do seu jeito,</em> no seu ritmo</h1>
          <p className="lp-desc">
            Conteúdos personalizados, exercícios interativos e acompanhamento próximo
            da sua professora — tudo em um só lugar.
          </p>
          <div className="lp-actions">
            <button className="btn-primary" onClick={() => navigate('/cadastro')}>Começar agora →</button>
            <button className="btn-secondary">Ver como funciona</button>
          </div>
          <div className="lp-stats">
            <div className="stat-item">
              <div className="stat-num">12+</div>
              <div className="stat-label">Módulos de conteúdo</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">200+</div>
              <div className="stat-label">Questões de prática</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Personalizado</div>
            </div>
          </div>
        </div>

        <div className="lp-hero-right">
          <div className="card-stack">
            <div className="badge-float">✓ Novo conteúdo disponível</div>
            <div className="mock-card">
              <div className="mock-card-header">
                <div className="mock-avatar a">AM</div>
                <div>
                  <div className="mock-name">Ana Martins</div>
                  <div className="mock-sub">Nível Intermediário · Semana 4</div>
                </div>
              </div>
              <div className="mock-prog-section">
                <div className="mock-prog-label-row"><span>Present Perfect</span><span>72%</span></div>
                <div className="mock-progress-bar"><div className="mock-progress-fill sage" style={{ width: '72%' }} /></div>
                <div className="mock-prog-label-row" style={{ marginTop: 8 }}><span>Listening</span><span>45%</span></div>
                <div className="mock-progress-bar"><div className="mock-progress-fill warm" style={{ width: '45%' }} /></div>
              </div>
            </div>
            <div className="mock-card">
              <div className="mock-card-section-label">Quiz · Gramática</div>
              <div className="mock-quiz">
                <div className="mock-quiz-q">She ___ to London twice this year.</div>
                <div className="mock-options">
                  <div className="mock-option">went</div>
                  <div className="mock-option correct">✓ has been</div>
                  <div className="mock-option">goes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-features">
        <div className="section-label">O que você encontra aqui</div>
        <div className="section-title">Tudo que você precisa para <em>evoluir de verdade</em></div>
        <div className="features-grid">
          {[
            { icon: '📚', title: 'Conteúdo personalizado', desc: 'Materiais organizados por nível e tema, escolhidos especialmente pela sua professora para o seu perfil.' },
            { icon: '✏️', title: 'Quiz interativos',       desc: 'Exercícios de gramática, vocabulário e compreensão com feedback imediato e acompanhamento de progresso.' },
            { icon: '📊', title: 'Acompanhamento real',    desc: 'Sua professora vê seu desempenho e adapta os conteúdos conforme você avança. Sem achismos.' },
          ].map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-cta">
        <h2>Pronto para<br /><em>evoluir no inglês?</em></h2>
        <p>Entre em contato com a professora e crie sua conta hoje.</p>
        <div className="cta-actions">
          <button className="btn-cta" onClick={() => navigate('/cadastro')}>Criar minha conta</button>
          <button className="btn-cta-outline">Falar com a professora</button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-logo" style={{ fontSize: 16 }}>english<span>flow</span></div>
        <div>© 2025 · Todos os direitos reservados</div>
      </footer>
    </div>
  );
}