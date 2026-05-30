import { useState, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Check } from 'lucide-react';
import Modal from '../ui/Modal';
import useUIStore from '../../store/useUIStore';
import { CONTENT_TYPES, FOLDER_COLORS } from '../../utils/constants';
import { createNode, updateNode } from '../../services/storageService';
import './Admin.css';

function CodeEditorModal() {
  const { activeModal, modalData, closeModal, triggerRefresh } = useUIStore();

  const isOpen = activeModal === 'createCode' || activeModal === 'editCode';
  const isEditing = activeModal === 'editCode';
  const existing = isEditing ? modalData : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [color, setColor] = useState(FOLDER_COLORS[1].value);
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name || '');
      setDescription(existing.metadata?.description || '');
      setCode(existing.content?.body || '');
      setLanguage(existing.metadata?.extension?.replace('.', '') || 'javascript');
      setColor(existing.metadata?.color || FOLDER_COLORS[1].value);
      setDownloadBlocked(existing.metadata?.downloadBlocked || false);
      setPassword(existing.metadata?.password || '');
      setHasPassword(!!existing.metadata?.password);
    } else if (isOpen) {
      setName('');
      setDescription('');
      setCode('');
      setLanguage('javascript');
      setColor(FOLDER_COLORS[1].value);
      setDownloadBlocked(false);
      setPassword('');
      setHasPassword(false);
    }
  }, [isOpen, existing]);

  const handleSave = () => {
    if (!name.trim()) return;

    const nodeData = {
      name: name.trim(),
      content: {
        type: CONTENT_TYPES.CODE,
        body: code,
      },
      metadata: {
        description: description.trim(),
        extension: `.${language}`,
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
        type: CONTENT_TYPES.CODE,
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
      title={isEditing ? 'Editar Código' : 'Novo Código'}
      size="lg"
    >
      <div className="content-editor">
        <div className="admin-form__group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label className="admin-form__label">Nome do Arquivo</label>
            <input
              type="text"
              className="admin-form__input"
              placeholder="Ex: main.cpp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="admin-form__label">Linguagem</label>
            <select 
              className="admin-form__input" 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Descrição</label>
          <input
            type="text"
            className="admin-form__input"
            placeholder="Breve descrição do código..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label">Cor do Ícone</label>
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
            <input type="checkbox" checked={downloadBlocked} onChange={e => setDownloadBlocked(e.target.checked)} />
            Bloquear Download
          </label>
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
            <label className="admin-form__label">Defina a Senha</label>
            <input
              type="text"
              className="admin-form__input"
              placeholder="Digite a senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className="admin-form__group">
          <label className="admin-form__label">Código-fonte</label>
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
            <CodeEditor
              value={code}
              language={language}
              placeholder="Digite seu código aqui..."
              onChange={(evn) => setCode(evn.target.value)}
              padding={15}
              style={{
                fontSize: 14,
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                minHeight: '200px'
              }}
            />
          </div>
        </div>

        <div className="admin-form__actions">
          <button type="button" className="admin-form__btn admin-form__btn--secondary" onClick={closeModal}>
            Cancelar
          </button>
          <button type="button" className="admin-form__btn admin-form__btn--primary" onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? 'Salvar Alterações' : 'Criar Código'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CodeEditorModal;
