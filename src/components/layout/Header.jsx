import { Link, useLocation } from 'react-router';
import { Menu, Lock, LogOut, ShieldCheck, Settings, Share2, Check, Layout, AlignLeft } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { APP_NAME } from '../../utils/constants';
import './Layout.css';

function Header() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeSlug = useAuthStore((s) => s.activeSlug);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const logout = useAuthStore((s) => s.logout);

  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarMobile = useUIStore((s) => s.setSidebarMobile);
  const openModal = useUIStore((s) => s.openModal);

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setSidebarMobile(true);
    } else {
      toggleSidebar();
    }
  };

  // Don't show header on landing page
  if (isLanding) return null;

  return (
    <header className="header">
      <div className="header__left">
        <Link to={`/${activeSlug}`} className="header__brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div className="header__logo" style={{ background: 'var(--primary-600)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlignLeft size={16} color="white" strokeWidth={2.5} />
          </div>
          <span className="header__logo-text" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{APP_NAME}</span>
        </Link>
      </div>

      <div className="header__center hide-on-mobile">
        <SearchBar />
      </div>

      <div className="header__right">
        <button
          className="header__share-btn"
          onClick={() => openModal('share', { url: window.location.href })}
          aria-label="Compartilhar"
          title="Compartilhar esta página"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--primary-50)', color: 'var(--primary-600)',
            padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--primary-100)', fontSize: '13px',
            fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
            marginRight: '0.5rem'
          }}
        >
          <Share2 size={16} />
          <span className="hide-on-mobile">Compartilhar</span>
        </button>
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAuthenticated ? (
            <div className="header__admin-group">
              <span className="header__admin-badge">
                <ShieldCheck size={14} />
                <span className="hide-on-mobile">Admin</span>
              </span>
              <button
                className="header__icon-btn"
                onClick={() => openModal('settings')}
                aria-label="Configurações"
                title="Configurações do Hub"
              >
                <Settings size={18} />
              </button>
              <button
                className="header__icon-btn"
                onClick={logout}
                aria-label="Sair"
                title="Sair do modo administrador"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => window.open('/', '_blank')}
                style={{
                  background: 'var(--primary-600)', color: 'white', padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-full)', border: 'none', fontSize: '13px',
                  fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '0.35rem'
                }}
                title="Crie seu próprio portfólio"
              >
                <AlignLeft size={14} />
                <span className="hide-on-mobile">Criar Portfólio</span>
              </button>
              <button
                className="header__icon-btn"
                onClick={openLoginModal}
                aria-label="Entrar como administrador"
                title="Entrar como administrador"
              >
                <Lock size={18} />
              </button>
            </div>
          )}
        </div>
        <button
          className="header__menu-btn"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}
          onClick={handleMenuClick}
          aria-label="Alternar menu lateral"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
