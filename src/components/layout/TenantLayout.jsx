import { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import { setTenant } from '../../services/storageService';

function TenantLayout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const initAuth = useAuthStore(s => s.init);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Check if slug exists in platform-users
    const users = JSON.parse(localStorage.getItem('platform-users') || '{}');
    
    // For local dev / legacy mode: if no users exist at all, we might allow 'default' or similar
    // But in strict mode, if slug is not in users, redirect to platform home
    if (!users[slug] && slug !== 'admin' && slug !== 'default') {
      navigate('/');
      return;
    }

    // 2. Set the active tenant in storageService
    setTenant(slug);

    // 3. Initialize auth store for this tenant (loads auth state and settings)
    initAuth(slug);
    
    // 4. Mark as ready so children can render with correct tenant data
    setIsReady(true);

  }, [slug, navigate, initAuth]);

  // Wait for initialization before rendering
  if (!isReady) return null;

  // Render children routes (LandingPage, ExplorerPage, ContentViewerPage)
  return <Outlet />;
}

export default TenantLayout;
