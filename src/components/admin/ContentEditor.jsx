import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';
import Modal from '../ui/Modal';
import useUIStore from '../../store/useUIStore';
import { CONTENT_TYPES, FOLDER_COLORS } from '../../utils/constants';
import { createNode, updateNode } from '../../services/storageService';
import { fileToBase64 } from '../../utils/helpers';
import './Admin.css';
import { Check } from 'lucide-react';

function ToolbarButton({ icon: Icon, isActive, onClick, title }) {
  return (
    <button
      type="button"
      className={`tiptap-toolbar__btn ${isActive ? 'tiptap-toolbar__btn--active' : ''}`}
      onClick={onClick}
      title={title}
    >
      <Icon size={16} />
    </button>
  );
}

function EditorToolbar({ editor }) {
  const fileInputRef = useRef(null);

  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      editor.chain().focus().setImage({ src: base64 }).run();
    } catch (err) {
      console.error('Falha ao processar imagem', err);
    }
    e.target.value = '';
  };

  return (
    <div className="tiptap-toolbar">
      <div className="tiptap-toolbar__group">
        <ToolbarButton
          icon={Bold}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Negrito"
        />
        <ToolbarButton
          icon={Italic}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Itálico"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Sublinhado"
        />
      </div>

      <div className="tiptap-toolbar__separator" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          icon={Heading2}
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Título 2"
        />
        <ToolbarButton
          icon={Heading3}
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Título 3"
        />
      </div>

      <div className="tiptap-toolbar__separator" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          icon={List}
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista com marcadores"
        />
        <ToolbarButton
          icon={ListOrdered}
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        />
        <ToolbarButton
          icon={Quote}
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citação"
        />
      </div>

      <div className="tiptap-toolbar__separator" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          icon={LinkIcon}
          isActive={editor.isActive('link')}
          onClick={setLink}
          title="Link"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <ToolbarButton
          icon={ImageIcon}
          isActive={editor.isActive('image')}
          onClick={() => fileInputRef.current?.click()}
          title="Inserir Imagem"
        />
      </div>

      <div className="tiptap-toolbar__separator" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          icon={AlignLeft}
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Alinhar à esquerda"
        />
        <ToolbarButton
          icon={AlignCenter}
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Centralizar"
        />
        <ToolbarButton
          icon={AlignRight}
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Alinhar à direita"
        />
      </div>

      <div className="tiptap-toolbar__separator" />

      <div className="tiptap-toolbar__group">
        <ToolbarButton
          icon={Undo}
          isActive={false}
          onClick={() => editor.chain().focus().undo().run()}
          title="Desfazer"
        />
        <ToolbarButton
          icon={Redo}
          isActive={false}
          onClick={() => editor.chain().focus().redo().run()}
          title="Refazer"
        />
      </div>
    </div>
  );
}

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever seu conteúdo aqui...',
      }),
    ],
    content: '',
  });

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name || '');
      setDescription(existing.metadata?.description || '');
      setColor(existing.metadata?.color || FOLDER_COLORS[2].value);
      setDownloadBlocked(existing.metadata?.downloadBlocked || false);
      setPassword(existing.metadata?.password || '');
      setHasPassword(!!existing.metadata?.password);
      if (editor && existing.content?.body) {
        editor.commands.setContent(existing.content.body);
      }
    } else if (isOpen) {
      setName('');
      setDescription('');
      setColor(FOLDER_COLORS[2].value);
      setDownloadBlocked(false);
      setPassword('');
      setHasPassword(false);
      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [isOpen, existing, editor]);

  const handleSave = async () => {
    if (!name.trim() || !editor) return;

    const htmlContent = editor.getHTML();
    const nodeData = {
      name: name.trim(),
      content: {
        type: CONTENT_TYPES.RICHTEXT,
        body: htmlContent,
      },
      metadata: {
        description: description.trim(),
        color,
        downloadBlocked,
        password: hasPassword ? (password.trim() || undefined) : undefined,
      },
    };

    if (isEditing && existing?.id) {
      await updateNode(existing.id, nodeData);
    } else {
      await createNode({
        ...nodeData,
        type: CONTENT_TYPES.RICHTEXT,
        parentId: modalData?.parentId || null,
      });
    }

    triggerRefresh();
    closeModal();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    if (editor) editor.commands.setContent('');
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Conteúdo' : 'Novo Conteúdo'}
      size="lg"
    >
      <div className="content-editor">
        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="content-name">
            Título do Conteúdo
          </label>
          <input
            id="content-name"
            type="text"
            className="admin-form__input"
            placeholder="Ex: Reflexão sobre Engenharia de Requisitos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="content-desc">
            Descrição
          </label>
          <input
            id="content-desc"
            type="text"
            className="admin-form__input"
            placeholder="Uma breve descrição do conteúdo..."
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

        <div className="admin-form__group">
          <label className="admin-form__label">Conteúdo</label>
          <div className="tiptap-editor">
            <EditorToolbar editor={editor} />
            <div className="tiptap-editor__content">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

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
            {isEditing ? 'Salvar Alterações' : 'Criar Conteúdo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ContentEditor;
