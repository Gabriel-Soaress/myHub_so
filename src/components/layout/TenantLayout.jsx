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

  // Wait for initialization before rendering
  if (!isReady) return null;

  // Render children routes (LandingPage, ExplorerPage, ContentViewerPage)
  return <Outlet />;
}

export default TenantLayout;
