import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layout, Mail, Lock, User, Link as LinkIcon } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Button from '../components/ui/Button';
import './LandingPage.css';

function PlatformHome() {
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);
  const login = useAuthStore(s => s.login);
  
  const [formMode, setFormMode] = useState('register'); // 'register' or 'login'
  const [formData, setFormData] = useState({ name: '', email: '', slug: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setFormData({ ...formData, slug: value });
  };

  const suggestSlug = (name) => {
    if (!formData.slug && name) {
      const suggested = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, slug: suggested }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (formMode === 'register') {
        if (!formData.name || !formData.email || !formData.slug || !formData.password) {
          setError('Por favor, preencha todos os campos.');
          setIsLoading(false);
          return;
        }
        const result = await register(formData.name, formData.email, formData.slug, formData.password);
        if (result.success) {
          navigate(`/${formData.slug}/explorar`);
        } else {
          setError(result.error);
          setIsLoading(false);
        }
      } else {
        if (!formData.email || !formData.password) {
          setError('Preencha seu e-mail e senha.');
          setIsLoading(false);
          return;
        }
        const targetSlug = await login(formData.password, formData.email);
        if (targetSlug) {
          navigate(`/${targetSlug}/explorar`);
        } else {
          setError('E-mail ou senha incorretos.');
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro interno. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="landing" style={{ '--primary-500': '#6366f1', '--primary-600': '#4f46e5' }}>
      <div className="landing__bg" style={{ background: `linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)` }} />
      
      {/* Decorative blobs */}
      <div className="landing__shapes" aria-hidden="true">
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <main style={{ 
        position: 'relative', 
        zIndex: 10, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '4rem', 
          maxWidth: '1200px', 
          width: '100%',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Hero Text */}
          <div className="animate-fade-in-up" style={{ paddingRight: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '999px', color: '#e2e8f0', marginBottom: '2rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Sparkles size={16} color="#818cf8" />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px' }}>Plataforma SaaS Premium</span>
            </div>

            <h1 style={{ fontSize: '4rem', lineHeight: '1.1', color: 'white', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
              Seu portfólio<br/>
              <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                em outro nível.
              </span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: '1.6', maxWidth: '480px' }}>
              Crie espaços organizados com proteção de senha, links curtos exclusivos e um design que impressiona.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Layout size={24} />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '0.25rem' }}>Editor Rico Integrado</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Escreva reflexões e artigos como no Notion.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '0.25rem' }}>Proteção Total</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Senhas em pastas e controle de download.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Glassmorphism Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.6)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '3rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
              
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => { setFormMode('register'); setError(''); }}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.125rem',
                    color: formMode === 'register' ? 'white' : '#64748b',
                    fontWeight: formMode === 'register' ? '600' : '500',
                    position: 'relative',
                    transition: 'color 0.2s'
                  }}
                >
                  Criar Conta
                  {formMode === 'register' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '2px', background: '#818cf8', borderRadius: '2px' }} />}
                </button>
                <button 
                  type="button"
                  onClick={() => { setFormMode('login'); setError(''); }}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.125rem',
                    color: formMode === 'login' ? 'white' : '#64748b',
                    fontWeight: formMode === 'login' ? '600' : '500',
                    position: 'relative',
                    transition: 'color 0.2s'
                  }}
                >
                  Entrar
                  {formMode === 'login' && <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '2px', background: '#818cf8', borderRadius: '2px' }} />}
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {formMode === 'register' && (
                  <div>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        type="text" 
                        placeholder="Nome Completo"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        onBlur={() => suggestSlug(formData.name)}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="email" 
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
                    />
                  </div>
                </div>

                {formMode === 'register' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', paddingLeft: '1rem' }}>
                      <LinkIcon size={18} color="#64748b" />
                      <span style={{ color: '#64748b', fontSize: '1rem', marginLeft: '0.5rem' }}>hub.com/</span>
                      <input 
                        type="text" 
                        placeholder="seu-link"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        style={{ border: 'none', background: 'transparent', padding: '1rem 0', outline: 'none', flex: 1, color: 'white', fontSize: '1rem', fontWeight: '500' }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="password" 
                      placeholder={formMode === 'register' ? 'Crie uma senha forte' : 'Sua senha'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.2s' }}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </div>
                )}

                <Button 
                  variant="primary" 
                  type="submit" 
                  size="lg" 
                  style={{ width: '100%', marginTop: '1rem', padding: '1.25rem', fontSize: '1.125rem', fontWeight: '600', borderRadius: '12px', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', border: 'none' }}
                >
                  {isLoading ? 'Carregando...' : (formMode === 'register' ? 'Criar meu Hub agora' : 'Acessar meu Hub')}
                  {!isLoading && <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />}
                </Button>
              </form>
            </div>
          </div>
          
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        input:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 1px #818cf8 !important;
        }
        @media (max-width: 900px) {
          main > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}} />
    </div>
  );
}

export default PlatformHome;
