import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FolderPlus, FilePlus, Upload, FolderOpen, FileCode, Download, Lock } from 'lucide-react';
import { getNodeById, getChildren, searchNodes, isNodeLockedCascading } from '../services/storageService';
import { downloadFolderAsZip } from '../services/exportService';
import useAuthStore from '../store/useAuthStore';
import useUIStore from '../store/useUIStore';
import Breadcrumb from '../components/layout/Breadcrumb';
import ExplorerGrid from '../components/explorer/ExplorerGrid';
import FolderCard from '../components/explorer/FolderCard';
import SuperFolderCard from '../components/explorer/SuperFolderCard';
import FileCard from '../components/explorer/FileCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import './ExplorerPage.css';

function ExplorerPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [currentNode, setCurrentNode] = useState(null);
  const [children, setChildren] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unlockedNodes = useAuthStore((s) => s.unlockedNodes);
  const unlockNode = useAuthStore((s) => s.unlockNode);
  const openModal = useUIStore((s) => s.openModal);
  const refreshKey = useUIStore((s) => s.refreshKey);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const isSearching = useUIStore((s) => s.isSearching);

  const loadData = useCallback(() => {
    if (folderId) {
      const node = getNodeById(folderId);
      setCurrentNode(node);
    } else {
      setCurrentNode(null);
    }
    const kids = getChildren(folderId || null);
    setChildren(kids);
  }, [folderId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Search
  useEffect(() => {
    if (isSearching && searchQuery.trim()) {
      const results = searchNodes(searchQuery);
      const filteredResults = results.filter(n => {
        if (isAuthenticated) return true;
        const lockStatus = isNodeLockedCascading(n.id, isAuthenticated, unlockedNodes);
        return !lockStatus.locked;
      });
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isSearching, refreshKey, isAuthenticated, unlockedNodes]);

  useEffect(() => {
    // Reset password state when changing folders
    setPasswordInput('');
    setPasswordError(false);
  }, [folderId]);

  const displayItems = isSearching ? searchResults : children;
  const folders = displayItems.filter((n) => n.type === 'folder');
  const files = displayItems.filter((n) => n.type !== 'folder');

  const isEmpty = folders.length === 0 && files.length === 0;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (lockStatus?.lockedNode && passwordInput === lockStatus.lockedNode.metadata.password) {
      unlockNode(lockStatus.lockedNode.id);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const lockStatus = currentNode ? isNodeLockedCascading(currentNode.id, isAuthenticated, unlockedNodes) : { locked: false };
  const isLocked = lockStatus.locked;

  if (isLocked) {
    return (
      <div className="explorer-page">
        <Breadcrumb nodeId={folderId} />
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Lock size={48} style={{ margin: '0 auto 1rem', color: 'var(--gray-400)' }} />
          <h2 style={{ marginBottom: '1rem' }}>Pasta Protegida</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--gray-500)' }}>Esta pasta requer senha para ser acessada.</p>
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

  return (
    <div className="explorer-page">
      <Breadcrumb nodeId={folderId} />

      {/* Page Header */}
      <div className="explorer-page__header">
        <div className="explorer-page__title-block">
          {isSearching ? (
            <>
              <h1 className="explorer-page__title">Resultados da busca</h1>
              <p className="explorer-page__subtitle">
                {displayItems.length} {displayItems.length === 1 ? 'resultado' : 'resultados'} para "{searchQuery}"
              </p>
            </>
          ) : (
            <>
              <h1 className="explorer-page__title">
                {currentNode ? currentNode.name : 'Meu Portfólio'}
              </h1>
              {currentNode?.metadata?.description && (
                <p className="explorer-page__subtitle">
                  {currentNode.metadata.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Admin Toolbar & Actions */}
        {!isSearching && (
          <div className="explorer-page__toolbar">
            {currentNode && !currentNode.metadata?.downloadBlocked && (
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => downloadFolderAsZip(currentNode)}
              >
                Baixar Pasta
              </Button>
            )}

            {isAuthenticated && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FolderPlus}
                  onClick={() => openModal('createFolder', { parentId: folderId || null })}
                >
                  Nova Pasta
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FilePlus}
                  onClick={() => openModal('createContent', { parentId: folderId || null })}
                >
                  Novo Conteúdo
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FileCode}
                  onClick={() => openModal('createCode', { parentId: folderId || null })}
                >
                  Novo Código
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => openModal('upload', { parentId: folderId || null })}
                >
                  Upload
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <EmptyState
          icon={FolderOpen}
          title={isSearching ? 'Nenhum resultado encontrado' : 'Pasta vazia'}
          description={
            isSearching
              ? 'Tente buscar com outros termos.'
              : 'Esta pasta ainda não possui conteúdo. Adicione pastas ou arquivos para começar.'
          }
          action={
            isAuthenticated && !isSearching ? (
              <Button
                variant="primary"
                size="sm"
                icon={FolderPlus}
                onClick={() => openModal('createFolder', { parentId: folderId || null })}
              >
                Criar primeira pasta
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {folders.length > 0 && (
            <section className="explorer-page__section">
              {!isSearching && files.length > 0 && (
                <h2 className="explorer-page__section-title">Pastas</h2>
              )}
              <ExplorerGrid>
                {folders.map((folder) => (
                  !folderId && !isSearching ? (
                    <SuperFolderCard key={folder.id} node={folder} />
                  ) : (
                    <FolderCard key={folder.id} node={folder} />
                  )
                ))}
              </ExplorerGrid>
            </section>
          )}

          {files.length > 0 && (
            <section className="explorer-page__section">
              {!isSearching && folders.length > 0 && (
                <h2 className="explorer-page__section-title">Conteúdos</h2>
              )}
              <ExplorerGrid>
                {files.map((file) => (
                  <FileCard key={file.id} node={file} />
                ))}
              </ExplorerGrid>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default ExplorerPage;
