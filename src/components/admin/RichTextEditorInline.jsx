import { useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Save
} from 'lucide-react';
import { fileToBase64 } from '../../utils/helpers';
import Button from '../ui/Button';
import './Admin.css';

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
    <div className="tiptap-toolbar" style={{ borderBottom: '1px solid var(--gray-200)' }}>
      <div className="tiptap-toolbar__group">
        <ToolbarButton icon={Bold} isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito" />
        <ToolbarButton icon={Italic} isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico" />
        <ToolbarButton icon={UnderlineIcon} isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado" />
      </div>
      <div className="tiptap-toolbar__separator" />
      <div className="tiptap-toolbar__group">
        <ToolbarButton icon={Heading2} isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2" />
        <ToolbarButton icon={Heading3} isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3" />
      </div>
      <div className="tiptap-toolbar__separator" />
      <div className="tiptap-toolbar__group">
        <ToolbarButton icon={List} isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista" />
        <ToolbarButton icon={ListOrdered} isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada" />
        <ToolbarButton icon={Quote} isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação" />
      </div>
      <div className="tiptap-toolbar__separator" />
      <div className="tiptap-toolbar__group">
        <ToolbarButton icon={LinkIcon} isActive={editor.isActive('link')} onClick={setLink} title="Link" />
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
        <ToolbarButton icon={ImageIcon} isActive={editor.isActive('image')} onClick={() => fileInputRef.current?.click()} title="Imagem" />
      </div>
      <div className="tiptap-toolbar__separator" />
      <div className="tiptap-toolbar__group">
        <ToolbarButton icon={AlignLeft} isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Alinhar à esquerda" />
        <ToolbarButton icon={AlignCenter} isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centralizar" />
        <ToolbarButton icon={AlignRight} isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Alinhar à direita" />
      </div>
      <div className="tiptap-toolbar__separator" />
      <div className="tiptap-toolbar__group">
        <ToolbarButton icon={Undo} isActive={false} onClick={() => editor.chain().focus().undo().run()} title="Desfazer" />
        <ToolbarButton icon={Redo} isActive={false} onClick={() => editor.chain().focus().redo().run()} title="Refazer" />
      </div>
    </div>
  );
}

function RichTextEditorInline({ initialContent, onSave, onCancel }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Comece a escrever seu conteúdo aqui...' }),
    ],
    content: initialContent || '',
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent || '');
    }
  }, [initialContent, editor]);

  const handleSaveClick = () => {
    if (editor) {
      onSave(editor.getHTML());
    }
  };

  return (
    <div className="tiptap-editor" style={{ marginTop: '1.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderBottom: '1px solid var(--primary-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-700)' }}>Modo de Edição de Texto</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSaveClick}>Salvar Texto</Button>
        </div>
      </div>
      <EditorToolbar editor={editor} />
      <div className="tiptap-editor__content" style={{ minHeight: '400px', padding: '2rem' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default RichTextEditorInline;
