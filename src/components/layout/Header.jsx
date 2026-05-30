import { Link, useLocation } from 'react-router';
import { Menu, Lock, LogOut, ShieldCheck, GraduationCap, Settings, Copy, Check, Layout } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { APP_NAME } from '../../utils/constants';
import './Layout.css';

function Header() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + window.location.pathname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Don't show header on landing page
  if (isLanding) return null;

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={handleMenuClick}
          aria-label="Alternar menu lateral"
        >
          <Menu size={20} />
        </button>
        <Link to={`/${activeSlug}`} className="header__brand">
          <div className="header__logo">
            <Layout size={20} color="var(--primary-600)" />
          </div>
          <span className="header__title">{APP_NAME}</span>
        </Link>
      </div>

      <div className="header__center">
        <div 
          className="header__copy-link" 
          onClick={handleCopyLink}
          title="Copiar link da página atual"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            background: 'var(--gray-100)', padding: '0.4rem 0.75rem', 
            borderRadius: 'var(--radius-full)', cursor: 'pointer',
            fontSize: '13px', color: 'var(--gray-600)',
            border: '1px solid var(--gray-200)', transition: 'all 0.2s'
          }}
        >
          <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {window.location.host}{window.location.pathname}
          </span>
          {copied ? <Check size={14} color="var(--success-500)" /> : <Copy size={14} />}
        </div>
      </div>

      <div className="header__right">
        <SearchBar />
        {isAuthenticated ? (
          <div className="header__admin-group">
            <span className="header__admin-badge">
              <ShieldCheck size={14} />
              Admin
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
          <button
            className="header__icon-btn"
            onClick={openLoginModal}
            aria-label="Entrar como administrador"
            title="Entrar como administrador"
          >
            <Lock size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
