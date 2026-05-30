import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Image, File, X, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import useUIStore from '../../store/useUIStore';
import { CONTENT_TYPES, ACCEPTED_FILE_TYPES, FOLDER_COLORS } from '../../utils/constants';
import { createNode, saveFile } from '../../services/storageService';
import { fileToBase64, formatFileSize, detectContentType, getFileExtension } from '../../utils/helpers';
import './Admin.css';

function FileUploader() {
  const { activeModal, modalData, closeModal, triggerRefresh } = useUIStore();
  const isOpen = activeModal === 'upload';

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[3].value);
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setName('');
      setDescription('');
      setColor(FOLDER_COLORS[3].value);
      setDownloadBlocked(false);
      setPassword('');
      setHasPassword(false);
      setIsDragging(false);
      setUploading(false);
    }
  }, [isOpen]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    setName(baseName);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) return;

    // Vercel serverless limits request body to ~4.5MB
    if (file.size > 4.5 * 1024 * 1024) {
      alert("O arquivo é muito grande. O limite máximo é de 4.5MB para esta plataforma.");
      return;
    }

    setUploading(true);
    try {
      const base64Data = await fileToBase64(file);
      const contentType = detectContentType(file.type);

      const node = await createNode({
        name: name.trim(),
        type: contentType,
        parentId: modalData?.parentId || null,
        content: {
          type: contentType,
          mimeType: file.type,
          originalName: file.name,
          size: file.size,
        },
        metadata: {
          description: description.trim(),
          fileSize: formatFileSize(file.size),
          extension: getFileExtension(file.name),
          originalName: file.name,
          color,
          downloadBlocked,
          password: hasPassword ? (password.trim() || undefined) : undefined,
        },
      });

      await saveFile(node.id, base64Data);
      triggerRefresh();
      closeModal();
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return <Image size={32} />;
    if (file.type === 'application/pdf') return <FileText size={32} />;
    return <File size={32} />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Upload de Arquivo"
    >
      <div className="file-uploader">
        {!file ? (
          <div
            className={`file-uploader__dropzone ${isDragging ? 'file-uploader__dropzone--active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={40} className="file-uploader__dropzone-icon" />
            <p className="file-uploader__dropzone-text">
              Arraste e solte um arquivo aqui
            </p>
            <p className="file-uploader__dropzone-hint">
              ou clique para selecionar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="file-uploader__input"
              onChange={handleInputChange}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.csv"
            />
          </div>
        ) : (
          <div className="file-uploader__preview">
            <button
              type="button"
              className="file-uploader__remove"
              onClick={removeFile}
              title="Remover arquivo"
            >
              <X size={16} />
            </button>

            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="file-uploader__thumbnail"
              />
            ) : (
              <div className="file-uploader__file-info">
                {getFileIcon()}
                <span className="file-uploader__file-name">{file.name}</span>
                <span className="file-uploader__file-size">
                  {formatFileSize(file.size)}
                </span>
              </div>
            )}
          </div>
        )}

        {file && (
          <>
            <div className="admin-form__group">
              <label className="admin-form__label" htmlFor="upload-name">
                Nome
              </label>
              <input
                id="upload-name"
                type="text"
                className="admin-form__input"
                placeholder="Nome do arquivo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label" htmlFor="upload-desc">
                Descrição
              </label>
              <input
                id="upload-desc"
                type="text"
                className="admin-form__input"
                placeholder="Descrição opcional..."
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
                onClick={handleUpload}
                disabled={!name.trim() || uploading}
              >
                {uploading ? 'Enviando...' : 'Fazer Upload'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default FileUploader;
