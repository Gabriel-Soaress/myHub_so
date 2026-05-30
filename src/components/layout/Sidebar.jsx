import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronRight, Folder, X, ArrowLeft } from 'lucide-react';
import { getChildren, getAncestors } from '../../services/storageService';
import useUIStore from '../../store/useUIStore';
import useAuthStore from '../../store/useAuthStore';
import './Layout.css';

function SidebarItem({ node, activeId, level = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const navigate = useNavigate();
  const refreshKey = useUIStore((s) => s.refreshKey);
  const activeSlug = useAuthStore((s) => s.activeSlug);

  const isActive = node.id === activeId;

  useEffect(() => {
    const kids = getChildren(node.id).filter((n) => n.type === 'folder');
    setChildren(kids);
  }, [node.id, refreshKey]);

  useEffect(() => {
    if (activeId) {
      const ancestors = getAncestors(activeId);
      if (ancestors.some(a => a.id === node.id)) {
        setExpanded(true);
      }
    }
  }, [activeId, node.id]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleNavigate = () => {
    navigate(`/${activeSlug}/explorar/${node.id}`);
    // Close mobile sidebar on navigation
    if (window.innerWidth < 768) {
      useUIStore.getState().closeMobileSidebar();
    }
  };

  const hasChildren = children.length > 0;

  return (
    <div className="sidebar-item">
      <button
        className={`sidebar-item__btn ${isActive ? 'sidebar-item__btn--active' : ''}`}
        style={{ paddingLeft: `${16 + level * 16}px` }}
        onClick={handleNavigate}
      >
        <span
          className={`sidebar-item__chevron ${hasChildren ? '' : 'sidebar-item__chevron--hidden'} ${expanded ? 'sidebar-item__chevron--expanded' : ''}`}
          onClick={hasChildren ? handleToggle : undefined}
        >
          <ChevronRight size={14} />
        </span>
        <Folder
          size={16}
          className="sidebar-item__folder-icon"
          style={node.metadata?.color ? { color: node.metadata.color } : undefined}
        />
        <span className="sidebar-item__name">{node.name}</span>
      </button>

      {expanded && hasChildren && (
        <div className="sidebar-item__children">
          {children.map((child) => (
            <SidebarItem
              key={child.id}
              node={child}
              activeId={activeId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar() {
  const [rootFolders, setRootFolders] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const activeSlug = useAuthStore((s) => s.activeSlug);

  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const isSidebarMobile = useUIStore((s) => s.isSidebarMobile);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const refreshKey = useUIStore((s) => s.refreshKey);

  // Extract active folder ID from URL
  const match = location.pathname.match(/\/explorar\/(.+)/);
  const activeId = match ? match[1] : null;

  const loadRootFolders = useCallback(() => {
    if (activeId) {
      const ancestors = getAncestors(activeId);
      if (ancestors.length > 0) {
        // The first ancestor is the root SuperFolder
        setRootFolders([ancestors[0]]);
        return;
      }
    }
    
    // Fallback or if no activeId
    const roots = getChildren(null).filter((n) => n.type === 'folder');
    setRootFolders(roots);
  }, [activeId]);

  useEffect(() => {
    loadRootFolders();
  }, [loadRootFolders, refreshKey]);

  // Don't render on landing page
  if (location.pathname === '/') return null;

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarMobile && (
        <div className="sidebar-overlay" onClick={closeMobileSidebar} />
      )}

      <aside
        className={`sidebar ${isSidebarOpen ? 'sidebar--open' : 'sidebar--closed'} ${isSidebarMobile ? 'sidebar--mobile-open' : ''}`}
      >
        <div className="sidebar__header">
          <h3 className="sidebar__title">Navegação</h3>
          <button
            className="sidebar__close-mobile"
            onClick={closeMobileSidebar}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {activeId && (
          <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <button 
              className="sidebar-item__btn" 
              style={{ paddingLeft: '8px', color: 'var(--gray-500)' }}
              onClick={() => {
                navigate(`/${activeSlug}/explorar`);
                if (window.innerWidth < 768) closeMobileSidebar();
              }}
            >
              <ArrowLeft size={14} style={{ marginRight: '8px' }} />
              Voltar à Raiz do Explorador
            </button>
          </div>
        )}

        <nav className="sidebar__nav">
          {rootFolders.length > 0 ? (
            rootFolders.map((folder) => (
              <SidebarItem
                key={folder.id}
                node={folder}
                activeId={activeId}
              />
            ))
          ) : (
            <p className="sidebar__empty">Nenhuma pasta criada</p>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
