import { useNavigate } from 'react-router';
import { Folder, MoreVertical, Pencil, Trash2, Download, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getChildren } from '../../services/storageService';
import { downloadFolderAsZip } from '../../services/exportService';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import './Explorer.css';

function FolderCard({ node }) {
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

  const color = node.metadata?.color || 'var(--primary-500)';

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
    <div className="folder-card" onClick={handleClick}>
      <div className="folder-card__header">
        <div className="folder-card__icon" style={{ backgroundColor: `${color}15`, color }}>
          <Folder size={24} />
        </div>
        <div className="folder-card__actions" onClick={(e) => e.stopPropagation()}>
          {!node.metadata?.downloadBlocked && !node.metadata?.password && (
            <button
              className="folder-card__action-btn"
              onClick={(e) => {
                e.stopPropagation();
                downloadFolderAsZip(node);
              }}
              aria-label="Baixar pasta em ZIP"
              title="Baixar em ZIP"
            >
              <Download size={14} />
            </button>
          )}
          {isAuthenticated && (
            <>
              <button
                className="folder-card__action-btn"
                onClick={(e) => { e.stopPropagation(); handleEdit(e); }}
                aria-label="Editar pasta"
                title="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                className="folder-card__action-btn folder-card__action-btn--danger"
                onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
                aria-label="Excluir pasta"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="folder-card__name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {node.metadata?.password && <Lock size={16} color="var(--gray-500)" />}
        {node.name}
      </h3>

      {node.metadata?.description && (
        <p className="folder-card__description">{node.metadata.description}</p>
      )}

      <span className="folder-card__count">
        {childCount} {childCount === 1 ? 'item' : 'itens'}
      </span>
    </div>
  );
}

export default FolderCard;
