import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import useUIStore from '../../store/useUIStore';
import { CONTENT_TYPES, FOLDER_COLORS } from '../../utils/constants';
import { createNode, updateNode } from '../../services/storageService';
import './Admin.css';
import { Check } from 'lucide-react';

function ContentEditor() {
  const { activeModal, modalData, closeModal, triggerRefresh } = useUIStore();

  const isOpen = activeModal === 'createContent' || activeModal === 'editContent';
  const isEditing = activeModal === 'editContent';
  const existing = isEditing ? modalData : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[2].value);
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name || '');
      setDescription(existing.metadata?.description || '');
      setColor(existing.metadata?.color || FOLDER_COLORS[2].value);
      setDownloadBlocked(existing.metadata?.downloadBlocked || false);
      setPassword(existing.metadata?.password || '');
      setHasPassword(!!existing.metadata?.password);
    } else if (isOpen) {
      setName('');
      setDescription('');
      setColor(FOLDER_COLORS[2].value);
      setDownloadBlocked(false);
      setPassword('');
      setHasPassword(false);
    }
  }, [isOpen, existing]);

  const handleSave = async () => {
    if (!name.trim()) return;

    // Se estiver editando, preservamos o tipo e conteúdo (se não for richtext, content já não seria alterado de qualquer forma, 
    // mas o importante é preservar a estrutura de content.body para códigos e richtext).
    // Se for um NOVO conteúdo, criamos como richtext com body vazio para ser editado depois na página do visualizador.
    
    const nodeData = {
      name: name.trim(),
      metadata: {
        ...(existing?.metadata || {}),
        description: description.trim(),
        color,
        downloadBlocked,
        password: hasPassword ? (password.trim() || undefined) : undefined,
      },
    };

    if (isEditing && existing?.id) {
      // Importante: NÃO mandamos 'type' ou 'content' no updateNode para arquivos de código/PDF/etc.,
      // para não sobrescrever os dados! (updateNode atualiza apenas o que é passado).
      // Mas se quisermos garantir, podemos não passar content. O banco de dados no backend ignora se for undefined.
      await updateNode(existing.id, nodeData);
    } else {
      // Novo conteúdo é criado como RichText
      await createNode({
        ...nodeData,
        type: CONTENT_TYPES.RICHTEXT,
        content: {
          type: CONTENT_TYPES.RICHTEXT,
          body: '', // Inicia vazio
        },
        parentId: modalData?.parentId || null,
      });
    }

    triggerRefresh();
    closeModal();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Arquivo' : 'Criar Documento'}
      size="md"
    >
      <div className="content-editor">
        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="content-name">
            {isEditing ? 'Nome do Arquivo' : 'Título do Documento'}
          </label>
          <input
            id="content-name"
            type="text"
            className="admin-form__input"
            placeholder={isEditing ? "Nome do arquivo" : "Ex: Reflexão sobre Requisitos"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="content-desc">
            Descrição
          </label>
          <textarea
            id="content-desc"
            className="admin-form__textarea"
            placeholder="Uma breve descrição..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
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

        <div className="admin-form__actions">
          <button
            type="button"
            className="admin-form__btn admin-form__btn--secondary"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="admin-form__btn admin-form__btn--primary"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Documento'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ContentEditor;
