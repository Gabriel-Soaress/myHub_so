import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  FileText,
  Image,
  FileDown,
  File,
  FileCode,
  Lock,
  Download,
  MoveRight
} from 'lucide-react';
import { getNodeById, getFile, isNodeLockedCascading } from '../services/storageService';
import { exportHtmlToPdf, exportHtmlToDocx } from '../services/exportService';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import { formatDate, base64ToBlob } from '../utils/helpers';

import RichTextViewer from '../components/viewers/RichTextViewer';
import PdfViewer from '../components/viewers/PdfViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import FileDownload from '../components/viewers/FileDownload';
import CodeViewer from '../components/viewers/CodeViewer';
import DocxViewer from '../components/viewers/DocxViewer';

import './ContentViewerPage.css';

function ContentViewerPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const [node, setNode] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // Guardar o parentId original para saber pra onde voltar caso seja excluído
  const [originalParentId, setOriginalParentId] = useState(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unlockedNodes = useAuthStore((s) => s.unlockedNodes);
  const unlockNode = useAuthStore((s) => s.unlockNode);
  const openModal = useUIStore((s) => s.openModal);
  const refreshKey = useUIStore((s) => s.refreshKey);

  useEffect(() => {
    setLoading(true);
    const found = getNodeById(nodeId);
    
    if (found) {
      setNode(found);
      setOriginalParentId(found.parentId);
      
      const lockStatus = isNodeLockedCascading(found.id, isAuthenticated, unlockedNodes);
      
      if (lockStatus.locked) {
        // Locked
      } else if (found.content?.type !== 'richtext') {
        const data = getFile(nodeId);
        setFileData(data);
      }
    } else {
      setNode(null);
    }

    setLoading(false);
  }, [nodeId, refreshKey, isAuthenticated, unlockedNodes]);

  const lockStatus = node ? isNodeLockedCascading(node.id, isAuthenticated, unlockedNodes) : { locked: false };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (lockStatus?.lockedNode && passwordInput === lockStatus.lockedNode.metadata.password) {
      unlockNode(lockStatus.lockedNode.id);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (loading) {
    return <div className="content-viewer content-viewer--loading">Carregando...</div>;
  }

  if (!node) {
    return (
      <div className="content-viewer content-viewer--not-found">
        <h2>Conteúdo não encontrado ou excluído</h2>
        <p>O conteúdo solicitado não existe ou foi removido do sistema.</p>
        <Button 
          variant="secondary" 
          icon={ArrowLeft} 
          onClick={() => navigate(originalParentId ? `/explorar/${originalParentId}` : '/explorar')}
        >
          Voltar para a pasta
        </Button>
      </div>
    );
  }

  const handleEdit = () => openModal('editContent', node);
  const handleDelete = () => openModal('delete', node);
  const handleMove = () => openModal('move', node);

  const isLocked = lockStatus.locked;

  if (isLocked) {
    return (
      <div className="content-viewer">
        <Breadcrumb nodeId={nodeId} />
        <button className="content-viewer__back" onClick={() => navigate(node.parentId ? `/explorar/${node.parentId}` : '/explorar')}>
          <ArrowLeft size={16} /><span>Voltar</span>
        </button>
        <div className="content-viewer__locked" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Lock size={48} style={{ margin: '0 auto 1rem', color: 'var(--gray-400)' }} />
          <h2 style={{ marginBottom: '1rem' }}>Conteúdo Protegido</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--gray-500)' }}>Este arquivo requer senha para ser visualizado.</p>
          <form onSubmit={handleUnlock} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', maxWidth: '300px', margin: '0 auto' }}>
            <input 
              type="password" 
              className="admin-form__input" 
              placeholder="Digite a senha" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)}
            />
            <Button variant="primary" type="submit">Entrar</Button>
          </form>
          {passwordError && <p style={{ color: 'var(--danger-500)', marginTop: '1rem', fontSize: '14px' }}>Senha incorreta.</p>}
        </div>
      </div>
    );
  }

  const contentType = node.content?.type || 'download';

  const TYPE_ICONS = {
    richtext: FileText,
    pdf: FileText,
    image: Image,
    download: FileDown,
    code: FileCode,
    docx: FileText
  };
  const ContentIcon = TYPE_ICONS[contentType] || File;

  return (
    <div className="content-viewer">
      <Breadcrumb nodeId={nodeId} />

      {/* Back button */}
      <button
        className="content-viewer__back"
        onClick={() => navigate(node.parentId ? `/explorar/${node.parentId}` : '/explorar')}
      >
        <ArrowLeft size={16} />
        <span>Voltar</span>
      </button>

      {/* Header */}
      <div className="content-viewer__header">
        <div className="content-viewer__title-row">
          <div className="content-viewer__icon">
            <ContentIcon size={24} />
          </div>
          <h1 className="content-viewer__title">{node.name}</h1>
        </div>

        <div className="content-viewer__meta">
          <span className="content-viewer__meta-item">
            <Calendar size={14} />
            Criado em {formatDate(node.createdAt)}
          </span>
          {node.updatedAt !== node.createdAt && (
            <span className="content-viewer__meta-item">
              <Clock size={14} />
              Atualizado em {formatDate(node.updatedAt)}
            </span>
          )}
        </div>

        <div className="content-viewer__actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {contentType === 'richtext' && (
            <>
              <Button variant="secondary" size="sm" icon={Download} onClick={() => exportHtmlToPdf('richtext-export-area', node.name)}>
                Exportar PDF
              </Button>
              <Button variant="secondary" size="sm" icon={FileDown} onClick={() => exportHtmlToDocx(node.content.body, node.name)}>
                Exportar DOCX
              </Button>
            </>
          )}

          {contentType !== 'richtext' && contentType !== 'download' && !node.metadata?.downloadBlocked && fileData && (
            <Button variant="secondary" size="sm" icon={Download} onClick={() => {
                const blob = base64ToBlob(fileData);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = node?.content?.originalName || node?.name;
                link.click();
                URL.revokeObjectURL(url);
            }}>
              Baixar Arquivo
            </Button>
          )}

          {isAuthenticated && (
            <div className="viewer-header__actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <Button variant="ghost" size="sm" icon={MoveRight} onClick={handleMove}>
                Mover
              </Button>
              <Button variant="ghost" size="sm" icon={Pencil} onClick={handleEdit}>
                Editar
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} onClick={handleDelete} className="text-danger">
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="content-viewer__body" id="richtext-export-area">
        {contentType === 'richtext' && <RichTextViewer content={node.content?.body} />}
        {contentType === 'pdf' && <PdfViewer nodeId={nodeId} />}
        {contentType === 'image' && <ImageViewer nodeId={nodeId} name={node.name} />}
        {contentType === 'code' && <CodeViewer nodeId={nodeId} node={node} />}
        {contentType === 'docx' && <DocxViewer nodeId={nodeId} node={node} />}
        {(contentType === 'download' || contentType === 'gallery') && (
          <FileDownload node={node} nodeId={nodeId} />
        )}
      </div>
    </div>
  );
}

export default ContentViewerPage;
