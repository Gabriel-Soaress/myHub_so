import { useNavigate } from 'react-router';
import { Folder, Pencil, Trash2, Download, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getChildren } from '../../services/storageService';
import { downloadFolderAsZip } from '../../services/exportService';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import './Explorer.css';

function SuperFolderCard({ node }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeSlug = useAuthStore((s) => s.activeSlug);
  const openModal = useUIStore((s) => s.openModal);
  const refreshKey = useUIStore((s) => s.refreshKey);
  const [childCount, setChildCount] = useState(0);

  useEffect(() => {
    const kids = getChildren(node.id);
    setChildCount(kids.length);
  }, [node.id, refreshKey]);

  // Pastel solid colors logic
  const rawColor = node.metadata?.color || 'var(--primary-500)';
  
  const handleClick = () => {
    navigate(`/${activeSlug}/explorar/${node.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    openModal('editFolder', node);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    openModal('delete', node);
  };

  return (
    <div 
      className="super-folder-card" 
      onClick={handleClick}
      style={{ 
        background: `linear-gradient(135deg, ${rawColor}20 0%, ${rawColor}05 100%)`, 
        border: `1px solid ${rawColor}40`,
        borderLeft: `6px solid ${rawColor}`
      }}
    >
      {/* Decorative large icon in background */}
      <Folder 
        size={140} 
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          color: rawColor,
          opacity: 0.05,
          transform: 'rotate(-10deg)'
        }} 
      />
      
      <div className="super-folder-card__header">
        <div className="super-folder-card__icon" style={{ backgroundColor: `${rawColor}30`, color: rawColor }}>
          <Folder size={32} />
        </div>
        
        <div className="super-folder-card__actions" onClick={(e) => e.stopPropagation()}>
          {!node.metadata?.downloadBlocked && !node.metadata?.password && (
            <button
              className="folder-card__action-btn"
              onClick={() => downloadFolderAsZip(node)}
              aria-label="Baixar pasta em ZIP"
              title="Baixar em ZIP"
              style={{ backgroundColor: 'white' }}
            >
              <Download size={14} />
            </button>
          )}
          {isAuthenticated && (
            <>
              <button className="folder-card__action-btn" onClick={handleEdit} title="Editar" style={{ backgroundColor: 'white' }}>
                <Pencil size={14} />
              </button>
              <button className="folder-card__action-btn folder-card__action-btn--danger" onClick={handleDelete} title="Excluir" style={{ backgroundColor: 'white' }}>
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="super-folder-card__body">
        <h2 className="super-folder-card__name" style={{ color: rawColor, filter: 'brightness(0.6)' }}>
          {node.metadata?.password && <Lock size={20} color="var(--gray-500)" style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
          {node.name}
        </h2>
        {node.metadata?.description && (
          <p className="super-folder-card__description">{node.metadata.description}</p>
        )}
      </div>

      <div className="super-folder-card__footer">
        <span className="super-folder-card__count">
          {childCount} {childCount === 1 ? 'conteúdo' : 'conteúdos'}
        </span>
        <span className="super-folder-card__explore">Explorar →</span>
      </div>
    </div>
  );
}

export default SuperFolderCard;
