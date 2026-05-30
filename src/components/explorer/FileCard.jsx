import { useNavigate } from 'react-router';
import { FileText, Image, FileDown, File, Pencil, Trash2, FileCode, Lock, MoveRight, Download, Video } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { formatDateShort } from '../../utils/helpers';
import { downloadSingleFile } from '../../services/exportService';
import './Explorer.css';

const TYPE_ICONS = {
  richtext: FileText,
  pdf: FileText,
  docx: FileText,
  image: Image,
  video: Video,
  gallery: Image,
  download: FileDown,
  code: FileCode,
};

const TYPE_COLORS = {
  richtext: 'var(--primary-500)',
  pdf: '#ef4444',
  image: '#10b981',
  video: '#8b5cf6',
  gallery: '#f59e0b',
  download: 'var(--gray-500)',
};

function FileCard({ node }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeSlug = useAuthStore((s) => s.activeSlug);
  const openModal = useUIStore((s) => s.openModal);

  const contentType = node.content?.type || 'download';
  const Icon = TYPE_ICONS[contentType] || File;
  const iconColor = node.metadata?.color || TYPE_COLORS[contentType] || 'var(--gray-500)';

  const handleClick = () => {
    navigate(`/${activeSlug}/conteudo/${node.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    openModal('editContent', node);
  };

  const handleMove = (e) => {
    e.stopPropagation();
    openModal('move', node);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    openModal('delete', node);
  };

  return (
    <div className="file-card" onClick={handleClick}>
      <div className="file-card__header">
        <div
          className="file-card__icon"
          style={{ backgroundColor: `${iconColor}12`, color: iconColor }}
        >
          <Icon size={22} />
        </div>
        <div className="file-card__actions" onClick={(e) => e.stopPropagation()}>
          {!node.metadata?.downloadBlocked && (
            <button
              className="file-card__action-btn"
              onClick={(e) => {
                e.stopPropagation();
                const unlockedNodes = useAuthStore.getState().unlockedNodes;
                const unlockNode = useAuthStore.getState().unlockNode;
                if (!isAuthenticated && node.metadata?.password && !unlockedNodes.includes(node.id)) {
                  const pass = window.prompt("Este item é protegido por senha. Digite a senha para baixar:");
                  if (pass !== node.metadata.password) {
                    alert("Senha incorreta.");
                    return;
                  }
                  unlockNode(node.id);
                }
                downloadSingleFile(node);
              }}
              aria-label="Baixar arquivo"
              title="Baixar"
            >
              <Download size={14} />
            </button>
          )}
          {isAuthenticated && (
            <>
              <button
                className="file-card__action-btn"
                onClick={handleMove}
                aria-label="Mover conteúdo"
                title="Mover"
              >
                <MoveRight size={14} />
              </button>
              <button
                className="file-card__action-btn"
                onClick={handleEdit}
                aria-label="Editar conteúdo"
                title="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                className="file-card__action-btn file-card__action-btn--danger"
                onClick={handleDelete}
                aria-label="Excluir conteúdo"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="file-card__name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {node.metadata?.password && <Lock size={16} color="var(--gray-500)" />}
        {node.name}
      </h3>

      {node.metadata?.description && (
        <p className="file-card__description">{node.metadata.description}</p>
      )}

      <span className="file-card__date">
        {formatDateShort(node.updatedAt || node.createdAt)}
      </span>
    </div>
  );
}

export default FileCard;
