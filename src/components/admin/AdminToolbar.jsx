import { FolderPlus, FilePlus, Upload } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import './Admin.css';

function AdminToolbar({ parentId }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUIStore((s) => s.openModal);

  if (!isAuthenticated) return null;

  return (
    <div className="admin-toolbar">
      <button
        className="admin-toolbar__btn"
        onClick={() => openModal('createFolder', { parentId })}
        title="Nova Pasta"
      >
        <FolderPlus size={18} />
        <span>Nova Pasta</span>
      </button>

      <div className="admin-toolbar__divider" />

      <button
        className="admin-toolbar__btn"
        onClick={() => openModal('createContent', { parentId })}
        title="Novo Conteúdo"
      >
        <FilePlus size={18} />
        <span>Novo Conteúdo</span>
      </button>

      <div className="admin-toolbar__divider" />

      <button
        className="admin-toolbar__btn"
        onClick={() => openModal('upload', { parentId })}
        title="Upload Arquivo"
      >
        <Upload size={18} />
        <span>Upload Arquivo</span>
      </button>
    </div>
  );
}

export default AdminToolbar;
