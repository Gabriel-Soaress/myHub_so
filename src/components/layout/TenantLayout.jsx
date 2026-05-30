import { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { setTenant, fetchTree } from '../../services/storageService';

function TenantLayout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const initAuth = useAuthStore(s => s.init);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      // Set active tenant so all API calls use it
      setTenant(slug);

      // Fetch the node tree from the Vercel API and load it into memory
      await fetchTree(slug);

      // Initialize auth store (loads settings and restores auth)
      await initAuth(slug);
      
      setIsReady(true);
    }
    
    setIsReady(false);
    loadTenant();
  }, [slug, initAuth]);

  const tenantNotFound = useAuthStore(s => s.tenantNotFound);

  // Wait for initialization before rendering
  if (!isReady) return null;

  if (tenantNotFound) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Página não encontrada</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
          O link que você tentou acessar não pertence a nenhum portfólio cadastrado.
        </p>
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'var(--primary-600)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          Ir para a Página Inicial
        </button>
      </div>
    );
  }

  // Render children routes (LandingPage, ExplorerPage, ContentViewerPage)
  return <Outlet />;
}

export default TenantLayout;
