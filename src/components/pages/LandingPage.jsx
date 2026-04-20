import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/LandingPage.css';

const WHATSAPP = 'https://wa.me/5511970618992?text=Ol%C3%A1%20Lydia!%20Tenho%20interesse%20nas%20suas%20aulas%20de%20ingl%C3%AAs.';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  }

  return (
    <div className="lp-root">
      <nav className="lp-nav">
        <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="lp-logo-img" />
        <div className="lp-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('como-funciona'); }}>Como funciona</a>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('conteudos'); }}>Conteúdo</a>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('contato'); }}>Contato</a>
          <button className="btn-nav" onClick={() => navigate('/login')}>Entrar</button>
        </div>
        <button className="lp-mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? '✕' : '☰'}
        </button>
      </nav>

      {mobileMenu && (
        <div className="lp-mobile-menu">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('como-funciona'); }}>Como funciona</a>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('conteudos'); }}>Conteúdo</a>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollTo('contato'); }}>Contato</a>
          <button className="btn-nav" onClick={() => navigate('/login')}>Entrar</button>
          <button className="btn-secondary" onClick={() => navigate('/cadastro')}>Criar conta</button>
        </div>
      )}

      <section className="lp-hero">
        <div className="lp-hero-left">
          <div className="lp-tag">Plataforma de inglês</div>
          <h1>Aprenda inglês <em>do seu jeito,</em> no seu ritmo</h1>
          <p className="lp-desc">
            Conteúdos personalizados, exercícios interativos e acompanhamento próximo
            da sua professora — tudo em um só lugar.
          </p>
          <div className="lp-actions">
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn-primary btn-primary-link">
              Falar com a professora →
            </a>
            <button className="btn-secondary" onClick={() => scrollTo('como-funciona')}>
              Ver como funciona
            </button>
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
                  <div className="mock-sub">B1 · Intermediate</div>
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

      <section className="lp-how" id="como-funciona">
        <div className="section-label">Como funciona</div>
        <div className="section-title">Simples, direto e <em>personalizado pra você</em></div>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <div className="lp-step-title">Fale com a professora</div>
            <p className="lp-step-desc">Entre em contato pelo WhatsApp e conheça os planos disponíveis.</p>
          </div>
          <div className="lp-step-arrow">→</div>
          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <div className="lp-step-title">Crie sua conta</div>
            <p className="lp-step-desc">Receba seu código de acesso e crie sua conta na plataforma.</p>
          </div>
          <div className="lp-step-arrow">→</div>
          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <div className="lp-step-title">Comece a aprender</div>
            <p className="lp-step-desc">Acesse seus conteúdos e quiz personalizados a qualquer hora.</p>
          </div>
        </div>
      </section>

      <section className="lp-features" id="conteudos">
        <div className="section-label">O que você encontra aqui</div>
        <div className="section-title">Tudo que você precisa para <em>evoluir de verdade</em></div>
        <div className="features-grid">
          {[
            { icon: '📚', title: 'Conteúdo personalizado', desc: 'Materiais organizados por nível e tema, escolhidos especialmente pela sua professora para o seu perfil.' },
            { icon: '✏️', title: 'Quiz interativos',        desc: 'Exercícios de gramática, vocabulário e compreensão com feedback imediato e acompanhamento de progresso.' },
            { icon: '📊', title: 'Acompanhamento real',     desc: 'Sua professora vê seu desempenho e adapta os conteúdos conforme você avança. Sem achismos.' },
          ].map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-cta" id="contato">
        <h2>Pronto para<br /><em>evoluir no inglês?</em></h2>
        <p>Fale com a professora e comece sua jornada hoje.</p>
        <div className="cta-actions">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn-cta">
            Falar pelo WhatsApp →
          </a>
          <button className="btn-cta-outline" onClick={() => navigate('/login')}>
            Já tenho conta
          </button>
        </div>
      </section>

      <footer className="lp-footer">
  <img src="/LOGO-LYDIA.PNG" alt="Seed English" className="lp-footer-logo" />
  <div>© 2026 · Todos os direitos reservados</div>
  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
    Desenvolvido por <a href="https://portfolio--lincoln.vercel.app/" target="_blank" rel="noreferrer" style={{ color: 'var(--sage)', textDecoration: 'none', fontWeight: 500 }}>Lincoln</a>
  </div>
</footer>
    </div>
  );
}