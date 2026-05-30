import { useState, useEffect } from 'react';
import { Folder, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import useUIStore from '../../store/useUIStore';
import { FOLDER_COLORS, CONTENT_TYPES } from '../../utils/constants';
import { createNode, updateNode } from '../../services/storageService';
import './Admin.css';

function FolderEditor() {
  const { activeModal, modalData, closeModal, triggerRefresh } = useUIStore();

  const isOpen = activeModal === 'createFolder' || activeModal === 'editFolder';
  const isEditing = activeModal === 'editFolder';
  const existing = isEditing ? modalData : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0].value);
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name || '');
      setDescription(existing.metadata?.description || '');
      setColor(existing.metadata?.color || FOLDER_COLORS[0].value);
      setDownloadBlocked(existing.metadata?.downloadBlocked || false);
      setPassword(existing.metadata?.password || '');
      setHasPassword(!!existing.metadata?.password);
    } else if (isOpen) {
      setName('');
      setDescription('');
      setColor(FOLDER_COLORS[0].value);
      setDownloadBlocked(false);
      setPassword('');
      setHasPassword(false);
    }
  }, [isOpen, existing]);

  const handleSave = () => {
    if (!name.trim()) return;

    const nodeData = {
      name: name.trim(),
      type: CONTENT_TYPES.FOLDER,
      metadata: {
        description: description.trim(),
        color,
        downloadBlocked,
        password: hasPassword ? (password.trim() || undefined) : undefined,
      },
    };

    if (isEditing && existing?.id) {
      updateNode(existing.id, nodeData);
    } else {
      createNode({
        ...nodeData,
        parentId: modalData?.parentId || null,
      });
    }

    triggerRefresh();
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? 'Editar Pasta' : 'Nova Pasta'}
    >
      <div className="folder-editor">
        <div className="folder-editor__preview">
          <Folder size={40} color={color} fill={color} fillOpacity={0.15} />
          <span className="folder-editor__preview-name">
            {name || 'Nome da pasta'}
          </span>
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="folder-name">
            Nome da Pasta
          </label>
          <input
            id="folder-name"
            type="text"
            className="admin-form__input"
            placeholder="Ex: Módulo 1 — Introdução"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="folder-desc">
            Descrição
          </label>
          <textarea
            id="folder-desc"
            className="admin-form__textarea"
            placeholder="Uma breve descrição sobre esta pasta..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Cor</label>
          <div className="color-picker">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`color-picker__circle ${color === c.value ? 'color-picker__circle--active' : ''}`}
                style={{ '--circle-color': c.value }}
                onClick={() => setColor(c.value)}
                title={c.name}
              >
                {color === c.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-form__group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={downloadBlocked} 
              onChange={e => setDownloadBlocked(e.target.checked)} 
            />
            Bloquear Download em ZIP
          </label>
        </div>

        <div className="admin-form__group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={hasPassword} 
              onChange={e => {
                setHasPassword(e.target.checked);
                if (!e.target.checked) setPassword('');
              }} 
            />
            Proteger com Senha
          </label>
        </div>

        {hasPassword && (
          <div className="admin-form__group">
            <label className="admin-form__label" htmlFor="folder-password">
              Defina a Senha
            </label>
            <input
              id="folder-password"
              type="text"
              className="admin-form__input"
              placeholder="Digite a senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className="admin-form__actions">
          <button
            type="button"
            className="admin-form__btn admin-form__btn--secondary"
            onClick={closeModal}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="admin-form__btn admin-form__btn--primary"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Pasta'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default FolderEditor;
