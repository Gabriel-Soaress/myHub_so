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
  ChevronLeft,
  MoveRight
} from 'lucide-react';
import { getNodeById, getFile, isNodeLockedCascading, updateNode, deleteNodeRecursive } from '../services/storageService';
import { exportHtmlToPdf, exportHtmlToDocx } from '../services/exportService';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import Breadcrumb from '../components/layout/Breadcrumb';
import Button from '../components/ui/Button';
import { formatDate, formatDateShort, base64ToBlob } from '../utils/helpers';

import RichTextViewer from '../components/viewers/RichTextViewer';
import PdfViewer from '../components/viewers/PdfViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import FileDownload from '../components/viewers/FileDownload';
import CodeViewer from '../components/viewers/CodeViewer';
import DocxViewer from '../components/viewers/DocxViewer';
import VideoViewer from '../components/viewers/VideoViewer';
import RichTextEditorInline from '../components/admin/RichTextEditorInline';

import './ContentViewerPage.css';

function ContentViewerPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const [node, setNode] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  
  const [originalParentId, setOriginalParentId] = useState(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeSlug = useAuthStore((s) => s.activeSlug);
  const unlockedNodes = useAuthStore((s) => s.unlockedNodes);
  const unlockNode = useAuthStore((s) => s.unlockNode);
  const openModal = useUIStore((s) => s.openModal);
  const refreshKey = useUIStore((s) => s.refreshKey);
  const triggerRefresh = useUIStore((s) => s.triggerRefresh);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const found = await getNodeById(nodeId);
      
      if (found) {
        setNode(found);
        setOriginalParentId(found.parentId);
        
        const lockStatus = isNodeLockedCascading(found.id, isAuthenticated, unlockedNodes);
        
        if (lockStatus.locked) {
          // Locked
        } else if (found.content?.type !== 'richtext' && found.content?.type !== 'code') {
          const data = await getFile(nodeId);
          setFileData(data);
        }
      } else {
        setNode(null);
      }

      setLoading(false);
    };
    loadContent();
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

  const handleEditMetadata = () => {
    openModal('editContent', node);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este arquivo?')) {
      await deleteNodeRecursive(node.id);
      triggerRefresh();
      navigate(node.parentId ? `/${activeSlug}/explorar/${node.parentId}` : `/${activeSlug}/explorar`);
    }
  };

  const handleSaveText = async (newHtml) => {
    try {
      await updateNode(node.id, {
        ...node,
        content: {
          ...node.content,
          body: newHtml
        }
      });
      setNode(prev => ({
        ...prev,
        content: {
          ...prev.content,
          body: newHtml
        }
      }));
      setIsEditingText(false);
      triggerRefresh();
    } catch (err) {
      alert('Erro ao salvar o texto: ' + err.message);
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
          onClick={() => navigate(originalParentId ? `/${activeSlug}/explorar/${originalParentId}` : `/${activeSlug}/explorar`)}
        >
          Voltar para a pasta
        </Button>
      </div>
    );
  }

  const isLocked = lockStatus.locked;

  if (isLocked) {
    return (
      <div className="content-viewer">
        <Breadcrumb nodeId={nodeId} />
        <button className="content-viewer__back" onClick={() => navigate(node.parentId ? `/${activeSlug}/explorar/${node.parentId}` : `/${activeSlug}/explorar`)}>
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
    video: FileDown, /* Can use a better icon if imported, but using FileDown as fallback */
    download: FileDown,
    code: FileCode,
    docx: FileText
  };
  const ContentIcon = TYPE_ICONS[contentType] || File;

  return (
    <div className="content-viewer animate-fade-in-up">
      <div className="content-viewer__top">
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => navigate(`/${activeSlug}/explorar/${node.parentId || ''}`)}>
          Voltar
        </Button>
        <Breadcrumb nodeId={node.id} />
      </div>

      <div className="content-viewer__container">
        <header className="content-viewer__header">
          <div className="viewer-header__info">
            <h1 className="viewer-header__title">{node.name}</h1>
            <div className="viewer-header__meta">
              <span>Criado em {formatDateShort(node.createdAt)}</span>
              {node.updatedAt && <span>Atualizado em {formatDateShort(node.updatedAt)}</span>}
              {node.metadata?.description && <span className="viewer-header__desc">{node.metadata.description}</span>}
            </div>
          </div>

          {isAuthenticated && (
            <div className="viewer-header__actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {contentType === 'richtext' && !isEditingText && (
                <Button variant="primary" size="sm" icon={FileText} onClick={() => setIsEditingText(true)}>
                  Editar Texto
                </Button>
              )}
              {contentType === 'richtext' && isEditingText && (
                <Button variant="secondary" size="sm" onClick={() => setIsEditingText(false)}>
                  Cancelar Edição
                </Button>
              )}
              
              <Button variant="ghost" size="sm" icon={MoveRight} onClick={() => openModal('move', node)}>
                Mover
              </Button>
              <Button variant="ghost" size="sm" icon={Pencil} onClick={handleEditMetadata}>
                {contentType === 'richtext' ? 'Opções' : 'Editar'}
              </Button>
              <Button variant="ghost" size="sm" icon={Trash2} onClick={handleDelete} className="text-danger">
                Excluir
              </Button>
            </div>
          )}
        </header>

        <div className="content-viewer__actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {contentType === 'richtext' && !node.metadata?.downloadBlocked && (
            <>
              <Button variant="secondary" size="sm" icon={Download} onClick={() => exportHtmlToPdf('richtext-export-area', node.name)}>
                Exportar PDF
              </Button>
              <Button variant="secondary" size="sm" icon={FileDown} onClick={() => exportHtmlToDocx(node.content.body, node.name)}>
                Exportar DOCX
              </Button>
            </>
          )}

          {contentType === 'code' && !node.metadata?.downloadBlocked && node.content?.body && (
            <Button variant="secondary" size="sm" icon={Download} onClick={() => {
                const blob = new Blob([node.content.body], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = node.metadata?.originalName || `${node.name}${node.metadata?.extension || '.txt'}`;
                link.click();
                URL.revokeObjectURL(url);
            }}>
              Baixar Código
            </Button>
          )}

          {contentType !== 'richtext' && contentType !== 'download' && contentType !== 'code' && !node.metadata?.downloadBlocked && fileData && (
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
        </div>

        <div className="content-viewer__body">
          {isEditingText && contentType === 'richtext' ? (
            <RichTextEditorInline 
              initialContent={node.content?.body} 
              onSave={handleSaveText} 
              onCancel={() => setIsEditingText(false)} 
            />
          ) : (
            <div id="richtext-export-area">
              {contentType === 'richtext' && <RichTextViewer content={node.content?.body} />}
              {contentType === 'pdf' && <PdfViewer nodeId={nodeId} />}
              {contentType === 'image' && <ImageViewer nodeId={nodeId} name={node.name} />}
              {contentType === 'video' && <VideoViewer nodeId={nodeId} name={node.name} fileData={fileData} />}
              {contentType === 'code' && <CodeViewer nodeId={nodeId} node={node} />}
              {contentType === 'docx' && <DocxViewer nodeId={nodeId} node={node} />}
              {(contentType === 'download' || contentType === 'gallery') && (
                <FileDownload node={node} nodeId={nodeId} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentViewerPage;
