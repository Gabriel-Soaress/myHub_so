import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ArrowRightLeft, Folder } from 'lucide-react';
import { getAllNodes, getAncestors, moveNode } from '../../services/storageService';
import useUIStore from '../../store/useUIStore';

function MoveModal() {
  const isOpen = useUIStore((s) => s.activeModal === 'move');
  const closeModal = useUIStore((s) => s.closeModal);
  const triggerRefresh = useUIStore((s) => s.triggerRefresh);
  const modalData = useUIStore((s) => s.modalData);

  const [availableFolders, setAvailableFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');

  useEffect(() => {
    if (isOpen && modalData) {
      const allNodes = getAllNodes();
      
      // Filter out only folders
      let folders = allNodes.filter(n => n.type === 'folder');

      // We cannot move a node into itself, or into its own descendants
      // So we filter out the node itself and any folder that has this node as an ancestor
      folders = folders.filter(folder => {
        if (folder.id === modalData.id) return false;
        
        const ancestors = getAncestors(folder.id);
        if (ancestors.some(a => a.id === modalData.id)) return false;
        
        return true;
      });

      // Map to include a display path (e.g. "Root > Pasta A > Subpasta")
      const formattedFolders = folders.map(folder => {
        const ancestors = getAncestors(folder.id);
        const path = ancestors.map(a => a.name).join(' / ');
        const rootColor = ancestors.length > 0 ? (ancestors[0].metadata?.color || 'var(--primary-500)') : (folder.metadata?.color || 'var(--primary-500)');
        return {
          ...folder,
          path,
          rootColor
        };
      }).sort((a, b) => a.path.localeCompare(b.path));

      setAvailableFolders(formattedFolders);
      setSelectedFolderId(''); // default to empty (which will mean Root)
    }
  }, [isOpen, modalData]);

  if (!isOpen || !modalData) return null;

  const handleMove = async () => {
    // If selectedFolderId is '', it means move to Root (null)
    const targetId = selectedFolderId || null;
    
    // Prevent moving to the same parent
    if (modalData.parentId === targetId) {
      closeModal();
      return;
    }

    await moveNode(modalData.id, targetId);
    triggerRefresh();
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Mover Conteúdo">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <ArrowRightLeft size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary-500)' }} />
        <h3>Mover "{modalData.name}"</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '0.5rem' }}>
          Selecione o novo local para este item.
        </p>
      </div>

      <div className="admin-form__group">
        <label className="admin-form__label">Pasta de Destino</label>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
          
          <div 
            onClick={() => setSelectedFolderId('')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', 
              cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              backgroundColor: selectedFolderId === '' ? 'var(--gray-100)' : 'transparent',
              fontWeight: selectedFolderId === '' ? '600' : '400'
            }}
          >
            <Folder size={18} color="var(--primary-500)" />
            Hub Principal (Raiz)
          </div>

          {availableFolders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', 
                cursor: 'pointer', borderRadius: 'var(--radius-sm)', marginBottom: '0.25rem',
                backgroundColor: selectedFolderId === folder.id ? `${folder.rootColor}50` : `${folder.rootColor}30`,
                fontWeight: selectedFolderId === folder.id ? '600' : '400',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <Folder size={18} color={folder.rootColor} />
              {folder.path}
            </div>
          ))}
        </div>
      </div>

      <div className="admin-form__actions" style={{ marginTop: '2rem' }}>
        <Button variant="ghost" onClick={closeModal}>Cancelar</Button>
        <Button variant="primary" onClick={handleMove}>Mover para cá</Button>
      </div>
    </Modal>
  );
}

export default MoveModal;
